import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Beautiful Embroidery Dress' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'A handcrafted embroidery product...' })
  @IsString()
  description: string;

  @ApiProperty({ example: 49.99 })
  @IsNumber()
  price: number;

  @ApiProperty({ required: false, example: 39.99 })
  @IsOptional()
  @IsNumber()
  specialPrice?: number;

  @ApiProperty({ example: ['image1.jpg', 'image2.jpg'] })
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @ApiProperty({ default: 100 })
  @IsOptional()
  @IsNumber()
  stock?: number;
}
