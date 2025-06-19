import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  Length,
  IsNumber,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ScammerType, ScammerStatus } from '../entities/scammer-report.entity';

export class CreateScammerReportDto {
  @ApiProperty({
    description: 'Type of scammer',
    enum: ScammerType,
    example: ScammerType.EMAIL,
  })
  @IsEnum(ScammerType)
  type: ScammerType;

  @ApiProperty({
    description: 'Identifier (email or phone number)',
    example: 'scammer@example.com',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  identifier: string;

  @ApiProperty({
    description: 'Description of the scam attempt',
    example: 'Tried to phish my login credentials',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 1000)
  description: string;

  @ApiProperty({
    description: 'Additional information about the report',
    example: 'This scammer has been active for weeks',
    required: false,
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  additionalInfo?: string;

  @ApiProperty({
    description: 'Source of the report',
    example: 'web',
    required: false,
  })
  @IsOptional()
  @IsString()
  source?: string;
}

export class CheckScammerDto {
  @ApiProperty({
    description: 'Type of identifier to check',
    enum: ScammerType,
    example: ScammerType.EMAIL,
  })
  @IsEnum(ScammerType)
  type: ScammerType;

  @ApiProperty({
    description: 'Identifier to check (email or phone)',
    example: 'suspicious@example.com',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  identifier: string;
}

export class UpdateScammerReportDto {
  @ApiProperty({
    description: 'Updated scammer status',
    enum: ScammerStatus,
    example: ScammerStatus.VERIFIED,
    required: false,
  })
  @IsOptional()
  @IsEnum(ScammerStatus)
  status?: ScammerStatus;

  @ApiProperty({
    description: 'Updated description',
    example: 'Updated after investigation',
    required: false,
    minLength: 10,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @Length(10, 1000)
  description?: string;

  @ApiProperty({
    description: 'Additional information',
    example: 'Investigation complete',
    required: false,
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  additionalInfo?: string;
}

export class SearchScammerReportsQueryDto {
  @ApiProperty({
    description: 'Search query for identifier or description',
    example: 'scammer@example.com',
    required: false,
    minLength: 1,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  query?: string;

  @ApiProperty({
    description: 'Filter by scammer type',
    enum: ScammerType,
    example: ScammerType.EMAIL,
    required: false,
  })
  @IsOptional()
  @IsEnum(ScammerType)
  type?: ScammerType;

  @ApiProperty({
    description: 'Filter by status',
    enum: ScammerStatus,
    example: ScammerStatus.PENDING,
    required: false,
  })
  @IsOptional()
  @IsEnum(ScammerStatus)
  status?: ScammerStatus;

  @ApiProperty({
    description: 'Number of results to return',
    example: 20,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    description: 'Number of results to skip',
    example: 0,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}

export class GetPendingReportsQueryDto {
  @ApiProperty({
    description: 'Number of pending reports to return',
    example: 50,
    minimum: 1,
    maximum: 200,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(200)
  limit?: number = 50;
}

export class GetStatsQueryDto {
  @ApiProperty({
    description: 'Number of days to include in statistics',
    example: 30,
    minimum: 1,
    maximum: 365,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(365)
  days?: number = 30;
}

export class GetAllScammerReportsQueryDto {
  @ApiProperty({
    description: 'Number of results to return',
    example: 100,
    minimum: 1,
    maximum: 1000,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number = 100;

  @ApiProperty({
    description: 'Number of results to skip',
    example: 0,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  @ApiProperty({
    description: 'Filter by scammer status',
    enum: ScammerStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ScammerStatus)
  status?: ScammerStatus;

  @ApiProperty({
    description: 'Filter by scammer type',
    enum: ScammerType,
    required: false,
  })
  @IsOptional()
  @IsEnum(ScammerType)
  type?: ScammerType;

  @ApiProperty({
    description: 'Filter from date (ISO string)',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  fromDate?: string;

  @ApiProperty({
    description: 'Filter to date (ISO string)',
    example: '2024-12-31T23:59:59.999Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  toDate?: string;

  @ApiProperty({
    description: 'Search query for identifier or description',
    example: 'scammer@example.com',
    required: false,
    minLength: 1,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  query?: string;
}

export class ScammerReportIdParamDto {
  @ApiProperty({
    description: 'Scammer report ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
