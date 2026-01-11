import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { CreateImageDto } from './dto/create-image.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import type { MulterFile } from './interfaces/multer-file.interface';

@Injectable()
export class ImagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
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
    file: MulterFile,
    createImageDto: CreateImageDto,
    userId: string,
  ) {
    try {
      this.logger.log(`Creating image for user: ${userId}`);

      const asset = await this.prisma.asset.create({
        data: {
          filename: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: file.path,
        },
      });

      this.logger.log(`Created asset: ${asset.id}`);

      const image = await this.prisma.image.create({
        data: {
          prompt: createImageDto.prompt,
          aspectRatio: createImageDto.aspectRatio,
          userId,
          assetId: asset.id,
        },
        include: {
          asset: true,
        },
      });

      this.logger.log(`Created image: ${image.id} with asset: ${asset.id}`);
      return image;
    } catch (error) {
      this.logger.error(`Failed to create image for user: ${userId}`, error);
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
