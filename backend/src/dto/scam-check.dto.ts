import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CheckMessageDto {
  @ApiProperty({
    description: 'Message content to check for scam patterns',
    example:
      'Congratulations! You have won $1,000,000. Click here to claim your prize.',
    minLength: 1,
    maxLength: 10000,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 10000)
  message: string;
}

export class GetCheckByIdParamDto {
  @ApiProperty({
    description: 'Check ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class DeleteCheckParamDto {
  @ApiProperty({
    description: 'Check ID to delete',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class GetChecksQueryDto {
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

export class GetRecentChecksQueryDto {
  @ApiProperty({
    description: 'Number of recent checks to return',
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

export class GetAllChecksQueryDto {
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
    description: 'Filter by check status',
    enum: ['SAFE', 'SUSPICIOUS', 'MALICIOUS', 'UNKNOWN'],
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: 'Filter by detected intent',
    enum: [
      'PHISHING',
      'ROMANCE_SCAM',
      'TECH_SUPPORT',
      'INVESTMENT_SCAM',
      'LOTTERY_SCAM',
      'OTHER',
    ],
    required: false,
  })
  @IsOptional()
  @IsString()
  intent?: string;

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
}
