import { Injectable } from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { Image } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export type ImageEntity = Omit<Image, 'timestamp'>;

@Injectable()
export class ImagesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string): Promise<ImageEntity[]> {
    const images = await this.prisma.image.findMany({
      where: { userId },
      orderBy: {
        timestamp: 'desc',
      },
    });
    return images;
  }

  async findOne(id: string, userId: string): Promise<ImageEntity | null> {
    const image = await this.prisma.image.findUnique({
      where: { id, userId },
    });

    if (!image) return null;

    return image;
  }

  async create(createImageDto: CreateImageDto, userId: string): Promise<void> {
    await this.prisma.image.create({
      data: {
        ...createImageDto,
        userId,
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.image.delete({
      where: { id },
    });
  }
}
