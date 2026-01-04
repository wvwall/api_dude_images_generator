import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateImageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @ApiProperty()
  @IsNumber()
  timestamp: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  aspectRatio: string;
}
