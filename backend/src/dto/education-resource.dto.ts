import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateEducationResourceDto {
  @ApiProperty({ description: 'Title of the resource' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Description of the resource' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'URL to the resource', required: false })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiProperty({ description: 'Image URL', required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

export class UpdateEducationResourceDto {
  @ApiProperty({ description: 'Title of the resource', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Description of the resource', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'URL to the resource', required: false })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiProperty({ description: 'Image URL', required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
