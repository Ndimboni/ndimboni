import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ContactCategory, ContactStatus } from '../entities/contact.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ description: 'Full name of the person contacting' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Email address', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ description: 'Subject of the message' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  subject: string;

  @ApiProperty({ description: 'Message content' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  message: string;

  @ApiProperty({
    enum: ContactCategory,
    description: 'Category of the contact message',
    default: ContactCategory.GENERAL_INQUIRY,
  })
  @IsEnum(ContactCategory)
  category: ContactCategory;
}

export class UpdateContactStatusDto {
  @ApiProperty({
    enum: ContactStatus,
    description: 'Status of the contact message',
  })
  @IsEnum(ContactStatus)
  status: ContactStatus;

  @ApiPropertyOptional({ description: 'Admin response to the message' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  adminResponse?: string;
}

export class ContactResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ enum: ContactCategory })
  category: ContactCategory;

  @ApiProperty({ enum: ContactStatus })
  status: ContactStatus;

  @ApiPropertyOptional()
  adminResponse?: string;

  @ApiPropertyOptional()
  respondedBy?: string;

  @ApiPropertyOptional()
  respondedAt?: Date;

  @ApiPropertyOptional()
  userId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ContactFiltersDto {
  @ApiPropertyOptional({ enum: ContactStatus })
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @ApiPropertyOptional({ enum: ContactCategory })
  @IsOptional()
  @IsEnum(ContactCategory)
  category?: ContactCategory;

  @ApiPropertyOptional({ description: 'Search by name or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
  })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 10,
  })
  @IsOptional()
  limit?: number;
}
