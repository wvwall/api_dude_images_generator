import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateImageDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsNumber()
  timestamp: number;

  @IsString()
  @IsNotEmpty()
  aspectRatio: string;
}
