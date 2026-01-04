import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
import { CreateImageDto } from './dto/create-image.dto';
import { Image } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

export type ImageEntity = Omit<Image, 'timestamp'> & { timestamp: number };

@Injectable()
export class ImagesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<ImageEntity[]> {
    const images = await this.prisma.image.findMany({
      orderBy: {
        timestamp: 'desc',
      },
    });
    // Convert BigInt to Number for JSON serialization
    return images.map((img) => ({
      ...img,
      timestamp: Number(img.timestamp),
    }));
  }

  async findOne(id: string): Promise<ImageEntity | null> {
    const image = await this.prisma.image.findUnique({
      where: { id },
    });

    if (!image) return null;

    return {
      ...image,
      timestamp: Number(image.timestamp),
    };
  }

  async create(createImageDto: CreateImageDto): Promise<void> {
    await this.prisma.image.create({
      data: {
        ...createImageDto,
        timestamp: BigInt(createImageDto.timestamp),
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.image.delete({
      where: { id },
    });
  }
}
