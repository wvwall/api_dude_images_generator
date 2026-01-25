import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { CreateImageDto, CreateImageSwaggerDto } from './dto/create-image.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { RequestWithUser } from 'src/auth/interfaces/active-user.interface';
import type { MulterMemoryFile } from './interfaces/multer-memory-file.interface';
import { multerConfig } from './config/multer.config';

@ApiTags('images')
@Controller({ path: 'images', version: '1' })
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all images for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Return all images' })
  async findAll(@Request() req: RequestWithUser) {
    return this.imagesService.findAll(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an image by id' })
  @ApiResponse({ status: 200, description: 'Return the image' })
  @ApiResponse({ status: 404, description: 'Image not found.' })
  async findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    const image = await this.imagesService.findOne(id, req.user.userId);
    if (!image) {
      throw new NotFoundException('Image not found');
    }
    return image;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateImageSwaggerDto })
  @ApiOperation({ summary: 'Upload and create a new image' })
  @ApiResponse({
    status: 201,
    description: 'The image has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid file or missing fields.' })
  async create(
    @UploadedFile() file: MulterMemoryFile | undefined,
    @Body() createImageDto: CreateImageDto,
    @Request() req: RequestWithUser,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    return this.imagesService.create(file, createImageDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an image and its asset' })
  @ApiResponse({
    status: 200,
    description: 'The image has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Image not found.' })
  async remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    const result = await this.imagesService.remove(id, req.user.userId);
    if (!result) {
      throw new NotFoundException('Image not found');
    }
    return { message: 'Image deleted successfully' };
  }
}
