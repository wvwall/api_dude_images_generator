import { Injectable } from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { Image } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export type ImageEntity = Omit<Image, 'timestamp'>;

@Injectable()
export class ImagesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<ImageEntity[]> {
    const images = await this.prisma.image.findMany({
      orderBy: {
        timestamp: 'desc',
      },
    });
    return images;
  }

  async findOne(id: string): Promise<ImageEntity | null> {
    const image = await this.prisma.image.findUnique({
      where: { id },
    });

    if (!image) return null;

    return image;
  }

  async create(createImageDto: CreateImageDto): Promise<void> {
    await this.prisma.image.create({
      data: {
        ...createImageDto,
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.image.delete({
      where: { id },
    });
  }
}
