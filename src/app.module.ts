import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImagesModule } from './images/images.module';
import { PrismaModule } from './prisma/prisma.module';
@Module({
  imports: [ImagesModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
