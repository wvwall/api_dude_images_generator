import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateVideoDto {
  @ApiProperty({
    description: 'The prompt used to generate the video',
    example: 'A cinematic timelapse of a city at sunset',
  })
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @ApiProperty({
    description: 'Duration of the video in seconds',
    example: 5.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  duration?: number;

  @ApiProperty({
    description: 'Resolution of the video',
    example: '1920x1080',
    required: false,
  })
  @IsOptional()
  @IsString()
  resolution?: string;
}

export class CreateVideoSwaggerDto extends CreateVideoDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Video file (MP4). Max 50MB',
  })
  video: Express.Multer.File;
}
