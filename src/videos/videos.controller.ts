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
import { VideosService } from './videos.service';
import { CreateVideoDto, CreateVideoSwaggerDto } from './dto/create-video.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { RequestWithUser } from 'src/auth/interfaces/active-user.interface';
import type { MulterMemoryFile } from './interfaces/multer-memory-file.interface';
import { multerConfig } from './config/multer.config';

@ApiTags('videos')
@Controller({ path: 'api/videos', version: '1' })
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all videos for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Return all videos' })
  async findAll(@Request() req: RequestWithUser) {
    return this.videosService.findAll(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a video by id' })
  @ApiResponse({ status: 200, description: 'Return the video' })
  @ApiResponse({ status: 404, description: 'Video not found.' })
  async findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    const video = await this.videosService.findOne(id, req.user.userId);
    if (!video) {
      throw new NotFoundException('Video not found');
    }
    return video;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('video', multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateVideoSwaggerDto })
  @ApiOperation({ summary: 'Upload and create a new video' })
  @ApiResponse({
    status: 201,
    description: 'The video has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid file or missing fields.' })
  async create(
    @UploadedFile() file: MulterMemoryFile | undefined,
    @Body() createVideoDto: CreateVideoDto,
    @Request() req: RequestWithUser,
  ) {
    if (!file) {
      throw new BadRequestException('Video file is required');
    }

    return this.videosService.create(file, createVideoDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a video and its asset' })
  @ApiResponse({
    status: 200,
    description: 'The video has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Video not found.' })
  async remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    const result = await this.videosService.remove(id, req.user.userId);
    if (!result) {
      throw new NotFoundException('Video not found');
    }
    return { message: 'Video deleted successfully' };
  }
}
