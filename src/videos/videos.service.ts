import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { CreateVideoDto } from './dto/create-video.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SupabaseStorageService } from 'src/storage/supabase-storage.service';
import type { MulterMemoryFile } from './interfaces/multer-memory-file.interface';

@Injectable()
export class VideosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
    private readonly storageService: SupabaseStorageService,
  ) {}

  async findAll(userId: string) {
    try {
      this.logger.log(`Fetching all videos for user: ${userId}`);

      const videos = await this.prisma.video.findMany({
        where: { userId },
        orderBy: {
          timestamp: 'desc',
        },
        include: {
          asset: true,
        },
      });

      this.logger.log(`Found ${videos?.length} videos for user: ${userId}`);
      return videos;
    } catch (error) {
      this.logger.error(`Failed to fetch videos for user: ${userId}`, error);
      throw new InternalServerErrorException('Failed to fetch videos');
    }
  }

  async findOne(id: string, userId: string) {
    try {
      this.logger.log(`Fetching video: ${id} for user: ${userId}`);

      const video = await this.prisma.video.findUnique({
        where: { id, userId },
        include: {
          asset: true,
        },
      });

      if (video) {
        this.logger.log(`Found video: ${id}`);
      } else {
        this.logger.warn(`Video not found: ${id} for user: ${userId}`);
      }

      return video;
    } catch (error) {
      this.logger.error(`Failed to fetch video: ${id}`, error);
      throw new InternalServerErrorException('Failed to fetch video');
    }
  }

  async create(
    file: MulterMemoryFile,
    createVideoDto: CreateVideoDto,
    userId: string,
  ) {
    this.logger.log(`Creating video for user: ${userId}`);

    let assetId: string | null = null;
    let videoId: string | null = null;

    try {
      // STEP 1: Create Asset with placeholder path
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

      // STEP 2: Create Video linked to Asset
      const video = await this.prisma.video.create({
        data: {
          prompt: createVideoDto.prompt,
          duration: createVideoDto.duration,
          resolution: createVideoDto.resolution,
          userId,
          assetId: asset.id,
        },
      });
      videoId = video.id;
      this.logger.log(`Created video: ${video.id} with asset: ${asset.id}`);

      // STEP 3: Upload to Supabase (LAST OPERATION) - use 'videos' folder
      const uploadResult = await this.storageService.upload(
        {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
        },
        'videos',
      );
      this.logger.log(`Uploaded to Supabase: ${uploadResult.publicUrl}`);

      // STEP 4: Update Asset with Supabase URL
      await this.prisma.asset.update({
        where: { id: asset.id },
        data: { path: uploadResult.publicUrl },
      });
      this.logger.log(`Updated asset path to: ${uploadResult.publicUrl}`);

      // Return Video with updated Asset
      return this.prisma.video.findUnique({
        where: { id: video.id },
        include: { asset: true },
      });
    } catch (error) {
      this.logger.error(`Failed to create video for user: ${userId}`, error);

      // ROLLBACK: If we created records in DB but upload failed
      if (videoId) {
        try {
          await this.prisma.video.delete({ where: { id: videoId } });
          this.logger.log(`Rollback: deleted video ${videoId}`);
        } catch (deleteError) {
          this.logger.error(
            `Rollback failed for video ${videoId}`,
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

      throw new InternalServerErrorException('Failed to create video');
    }
  }

  async remove(id: string, userId: string) {
    try {
      this.logger.log(`Removing video: ${id} for user: ${userId}`);

      const video = await this.prisma.video.findUnique({
        where: { id, userId },
        include: { asset: true },
      });

      if (!video) {
        this.logger.warn(`Video not found for deletion: ${id}`);
        return null;
      }

      // First delete from Supabase Storage
      if (video.asset) {
        const storagePath = this.storageService.extractPathFromUrl(
          video.asset.path,
        );
        if (storagePath) {
          await this.storageService.delete(storagePath);
          this.logger.log(`Deleted from Supabase: ${storagePath}`);
        }
      }

      // Then delete from DB
      await this.prisma.video.delete({
        where: { id },
      });
      this.logger.log(`Deleted video: ${id}`);

      if (video.asset) {
        await this.prisma.asset.delete({
          where: { id: video.assetId },
        });
        this.logger.log(`Deleted asset: ${video.assetId}`);
      }

      return video;
    } catch (error) {
      this.logger.error(`Failed to remove video: ${id}`, error);
      throw new InternalServerErrorException('Failed to remove video');
    }
  }
}
