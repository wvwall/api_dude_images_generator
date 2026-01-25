import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateImageDto {
  @ApiProperty({
    description: 'The prompt used to generate the image',
    example: 'A beautiful sunset over the ocean',
  })
  @IsString()
  @IsNotEmpty()
  prompt!: string;

  @ApiProperty({
    description: 'The aspect ratio of the image',
    example: '16:9',
  })
  @IsString()
  @IsNotEmpty()
  aspectRatio!: string;
}

export class CreateImageSwaggerDto extends CreateImageDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image file (PNG, JPEG, WebP). Max 10MB',
  })
  image!: Express.Multer.File;
}
