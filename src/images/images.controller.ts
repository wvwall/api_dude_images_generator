import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get()
  async findAll() {
    return this.imagesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.imagesService.findOne(id);
  }

  @Post()
  async create(@Body() createImageDto: CreateImageDto) {
    return this.imagesService.create(createImageDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.imagesService.remove(id);
  }
}
