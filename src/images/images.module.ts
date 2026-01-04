import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ImagesService } from './images.service';

@Module({
  imports: [PrismaModule],
  controllers: [ImagesController],
  providers: [ImagesService],
})
export class ImagesModule {}
