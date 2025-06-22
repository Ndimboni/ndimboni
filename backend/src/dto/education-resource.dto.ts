import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { ResourceStatus } from '../entities/education-resource.entity';

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

  @ApiPropertyOptional({
    description: 'ID of the next resource in sequence',
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  nextResourceId?: string;

  @ApiPropertyOptional({
    description: 'ID of the parent resource (module/section)',
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({ description: 'Category of the resource', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'Status of the resource',
    enum: ResourceStatus,
    default: ResourceStatus.DRAFT,
    required: false,
  })
  @IsOptional()
  @IsEnum(ResourceStatus)
  status?: ResourceStatus;
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

  @ApiProperty({ description: 'Category of the resource', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'Status of the resource',
    enum: ResourceStatus,
    default: ResourceStatus.DRAFT,
    required: false,
  })
  @IsOptional()
  @IsEnum(ResourceStatus)
  status?: ResourceStatus;
}

export class CreateEducationResourceFormDto {
  @ApiProperty({
    description: 'Title of the resource',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Description of the resource',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'URL to the resource',
    type: 'string',
  })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional({
    description: 'Image URL (if not uploading file)',
    type: 'string',
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Category of the resource',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'ID of the next resource in sequence',
    type: 'string',
  })
  @IsOptional()
  @IsUUID()
  nextResourceId?: string;

  @ApiPropertyOptional({
    description: 'ID of the parent resource (module/section)',
    type: 'string',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({
    description: 'Status of the resource',
    enum: ResourceStatus,
    default: ResourceStatus.DRAFT,
    type: 'string',
  })
  @IsOptional()
  @IsEnum(ResourceStatus)
  status?: ResourceStatus;

  @ApiPropertyOptional({
    description: 'Image file to upload',
    type: 'string',
    format: 'binary',
  })
  image?: any;
}
