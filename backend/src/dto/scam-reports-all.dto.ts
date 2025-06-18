import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ScamStatus, ScamType } from '../entities/scam-report.entity';

export class GetAllScamReportsQueryDto {
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
    description: 'Filter by report status',
    enum: ScamStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ScamStatus)
  status?: ScamStatus;

  @ApiProperty({
    description: 'Filter by scam type',
    enum: ScamType,
    required: false,
  })
  @IsOptional()
  @IsEnum(ScamType)
  scamType?: ScamType;

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
    description: 'Filter by user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class ScamReportIdParamDto {
  @ApiProperty({
    description: 'Scam report ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class UserIdParamDto {
  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}

export class UpdateStatusDto {
  @ApiProperty({
    description: 'New status for the scam report',
    enum: ScamStatus,
    example: ScamStatus.VERIFIED,
  })
  @IsEnum(ScamStatus)
  @IsNotEmpty()
  status: ScamStatus;
}
