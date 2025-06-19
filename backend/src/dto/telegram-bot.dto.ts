import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ScammerType } from '../entities/scammer-report.entity';

export class TelegramCheckDto {
  @ApiProperty({
    description: 'Message to check for scam patterns',
    example: 'Click this link to win $1000000!',
    minLength: 1,
    maxLength: 4000,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 4000)
  message: string;
}

export class TelegramReportDto {
  @ApiProperty({
    description: 'Type of scammer',
    enum: ScammerType,
    example: ScammerType.EMAIL,
  })
  @IsEnum(ScammerType)
  type: ScammerType;

  @ApiProperty({
    description: 'Identifier (email, phone, etc.)',
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
    example: 'This person tried to steal my personal information',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 1000)
  description: string;

  @ApiProperty({
    description: 'Additional information',
    example: 'They contacted me via WhatsApp',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  additionalInfo?: string;
}

export class TelegramStatsQueryDto {
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

export class AnalyzeMessageDto {
  @ApiProperty({
    description: 'Message to analyze for scam content',
    example:
      'Congratulations! You have won $1,000,000. Click here to claim your prize.',
    minLength: 1,
    maxLength: 4000,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 4000)
  message: string;
}

export class WebhookUpdateDto {
  @ApiProperty({
    description: 'Telegram webhook update object',
    example: {
      update_id: 123456789,
      message: {
        message_id: 1,
        from: { id: 123456, first_name: 'John' },
        chat: { id: -123456, type: 'group' },
        date: 1640995200,
        text: 'Hello, bot!',
      },
    },
  })
  update_id: number;
  message?: any;
  edited_message?: any;
  channel_post?: any;
  edited_channel_post?: any;
  inline_query?: any;
  chosen_inline_result?: any;
  callback_query?: any;
}
