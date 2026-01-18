import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { CreateImageDto } from './dto/create-image.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SupabaseStorageService } from 'src/storage/supabase-storage.service';
import type { MulterMemoryFile } from './interfaces/multer-memory-file.interface';

@Injectable()
export class ImagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
    private readonly storageService: SupabaseStorageService,
  ) {}

  async findAll(userId: string) {
    try {
      this.logger.log(`Fetching all images for user: ${userId}`);

      const images = await this.prisma.image.findMany({
        where: { userId },
        orderBy: {
          timestamp: 'desc',
        },
        include: {
          asset: true,
        },
      });

      this.logger.log(`Found ${images.length} images for user: ${userId}`);
      return images;
    } catch (error) {
      this.logger.error(`Failed to fetch images for user: ${userId}`, error);
      throw new InternalServerErrorException('Failed to fetch images');
    }
  }

  async findOne(id: string, userId: string) {
    try {
      this.logger.log(`Fetching image: ${id} for user: ${userId}`);

      const image = await this.prisma.image.findUnique({
        where: { id, userId },
        include: {
          asset: true,
        },
      });

      if (image) {
        this.logger.log(`Found image: ${id}`);
      } else {
        this.logger.warn(`Image not found: ${id} for user: ${userId}`);
      }

      return image;
    } catch (error) {
      this.logger.error(`Failed to fetch image: ${id}`, error);
      throw new InternalServerErrorException('Failed to fetch image');
    }
  }

  async create(
    file: MulterMemoryFile,
    createImageDto: CreateImageDto,
    userId: string,
  ) {
    this.logger.log(`Creating image for user: ${userId}`);

    let assetId: string | null = null;
    let imageId: string | null = null;

    try {
      // STEP 1: Crea Asset con path placeholder
      const asset = await this.prisma.asset.create({
        data: {
          filename: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: 'pending-upload',
        },
      });
      assetId = asset.id;
      this.logger.log(`Created asset with placeholder: ${asset.id}`);

      // STEP 2: Crea Image collegata all'Asset
      const image = await this.prisma.image.create({
        data: {
          prompt: createImageDto.prompt,
          aspectRatio: createImageDto.aspectRatio,
          userId,
          assetId: asset.id,
        },
      });
      imageId = image.id;
      this.logger.log(`Created image: ${image.id} with asset: ${asset.id}`);

      // STEP 3: Upload su Supabase (ULTIMA OPERAZIONE)
      const uploadResult = await this.storageService.upload({
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
      });
      this.logger.log(`Uploaded to Supabase: ${uploadResult.publicUrl}`);

      // STEP 4: Aggiorna Asset con URL Supabase
      await this.prisma.asset.update({
        where: { id: asset.id },
        data: { path: uploadResult.publicUrl },
      });
      this.logger.log(`Updated asset path to: ${uploadResult.publicUrl}`);

      // Ritorna Image con Asset aggiornato
      return this.prisma.image.findUnique({
        where: { id: image.id },
        include: { asset: true },
      });
    } catch (error) {
      this.logger.error(`Failed to create image for user: ${userId}`, error);

      // ROLLBACK: Se abbiamo creato record nel DB ma upload è fallito
      if (imageId) {
        try {
          await this.prisma.image.delete({ where: { id: imageId } });
          this.logger.log(`Rollback: deleted image ${imageId}`);
        } catch (deleteError) {
          this.logger.error(
            `Rollback failed for image ${imageId}`,
            deleteError,
          );
        }
      }
      if (assetId) {
        try {
          await this.prisma.asset.delete({ where: { id: assetId } });
          this.logger.log(`Rollback: deleted asset ${assetId}`);
        } catch (deleteError) {
          this.logger.error(
            `Rollback failed for asset ${assetId}`,
            deleteError,
          );
        }
      }

      throw new InternalServerErrorException('Failed to create image');
    }
  }

  async remove(id: string, userId: string) {
    try {
      this.logger.log(`Removing image: ${id} for user: ${userId}`);

      const image = await this.prisma.image.findUnique({
        where: { id, userId },
        include: { asset: true },
      });

      if (!image) {
        this.logger.warn(`Image not found for deletion: ${id}`);
        return null;
      }

      // Prima elimina da Supabase Storage
      if (image.asset) {
        const storagePath = this.storageService.extractPathFromUrl(
          image.asset.path,
        );
        if (storagePath) {
          await this.storageService.delete(storagePath);
          this.logger.log(`Deleted from Supabase: ${storagePath}`);
        }
      }

      // Poi elimina dal DB
      await this.prisma.image.delete({
        where: { id },
      });
      this.logger.log(`Deleted image: ${id}`);

      if (image.asset) {
        await this.prisma.asset.delete({
          where: { id: image.assetId },
        });
        this.logger.log(`Deleted asset: ${image.assetId}`);
      }

      return image;
    } catch (error) {
      this.logger.error(`Failed to remove image: ${id}`, error);
      throw new InternalServerErrorException('Failed to remove image');
    }
  }
}
