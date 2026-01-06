import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateImageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  aspectRatio: string;

  @ApiProperty({ description: 'ID of the user who owns this image' })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
