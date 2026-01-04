import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';

@ApiTags('images')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all images' })
  @ApiResponse({ status: 200, description: 'Return all images.' })
  async findAll() {
    return this.imagesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an image by id' })
  @ApiResponse({ status: 200, description: 'Return the image.' })
  @ApiResponse({ status: 404, description: 'Image not found.' })
  async findOne(@Param('id') id: string) {
    return this.imagesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new image' })
  @ApiResponse({
    status: 201,
    description: 'The image has been successfully created.',
  })
  async create(@Body() createImageDto: CreateImageDto) {
    return this.imagesService.create(createImageDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an image' })
  @ApiResponse({
    status: 200,
    description: 'The image has been successfully deleted.',
  })
  async remove(@Param('id') id: string) {
    return this.imagesService.remove(id);
  }
}
