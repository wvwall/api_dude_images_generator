import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { RequestWithUser } from 'src/auth/interfaces/active-user.interface';

@ApiTags('images')
@Controller({ path: 'images', version: '1' })
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all images' })
  @ApiResponse({ status: 200, description: 'Return all images.' })
  async findAll(@Request() req: RequestWithUser) {
    return this.imagesService.findAll(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an image by id' })
  @ApiResponse({ status: 200, description: 'Return the image.' })
  @ApiResponse({ status: 404, description: 'Image not found.' })
  async findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.imagesService.findOne(id, req.user.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new image' })
  @ApiResponse({
    status: 201,
    description: 'The image has been successfully created.',
  })
  async create(
    @Body() createImageDto: CreateImageDto,
    @Request() req: RequestWithUser,
  ) {
    return this.imagesService.create(createImageDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an image' })
  @ApiResponse({
    status: 200,
    description: 'The image has been successfully deleted.',
  })
  async remove(@Param('id') id: string) {
    return this.imagesService.remove(id);
  }
}
