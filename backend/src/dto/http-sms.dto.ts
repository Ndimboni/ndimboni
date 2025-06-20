import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  Length,
  IsNumber,
  Min,
  Max,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ScammerType } from 'src/entities';

// CloudEvents message data structure for different event types
export class MessageDataDto {
  @ApiProperty({
    description: 'Phone number of the contact/sender',
    example: '+18005550100',
  })
  @IsString()
  @IsNotEmpty()
  contact: string;

  @ApiProperty({
    description: 'SMS content/message',
    example: 'This is a test incoming message',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Message ID',
    example: '0b0123bb-ef2e-468f-908a-c026d51636aa',
  })
  @IsString()
  @IsNotEmpty()
  message_id: string;

  @ApiProperty({
    description: 'Phone number of the message owner',
    example: '+18005550199',
  })
  @IsString()
  @IsNotEmpty()
  owner: string;

  @ApiProperty({
    description: 'SIM card identifier',
    example: 'SIM1',
  })
  @IsString()
  @IsNotEmpty()
  sim: string;

  @ApiProperty({
    description: 'Message timestamp',
    example: '2023-06-29T03:21:19.814Z',
  })
  @IsDateString()
  timestamp: string;

  @ApiProperty({
    description: 'User ID',
    example: 'XtABz6zdeFMoBLoltz6SREDvRSh2',
  })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    description: 'Request ID (optional)',
    example: 'optional request id',
    required: false,
  })
  @IsOptional()
  @IsString()
  request_id?: string;

  @ApiProperty({
    description: 'Error message for failed events',
    example: 'MOBILE_APP_INACTIVE',
    required: false,
  })
  @IsOptional()
  @IsString()
  error_message?: string;

  @ApiProperty({
    description: 'Phone ID for heartbeat events',
    example: 'ff313c14-17a3-4f74-bcb2-ca77213a64af',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone_id?: string;

  @ApiProperty({
    description: 'Monitor ID for heartbeat events',
    example: 'ff313c14-17a3-4f74-bcb2-ca77213a64af',
    required: false,
  })
  @IsOptional()
  @IsString()
  monitor_id?: string;

  @ApiProperty({
    description: 'Last heartbeat timestamp',
    example: '2023-07-17T19:10:43.461254738Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  last_heartbeat_timestamp?: string;

  @ApiProperty({
    description: 'Send attempt count for expired messages',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  send_attempt_count?: number;

  @ApiProperty({
    description: 'Whether this is the final attempt',
    example: true,
    required: false,
  })
  @IsOptional()
  is_final?: boolean;
}

// CloudEvents webhook payload structure
export class HttpSmsWebhookDto {
  @ApiProperty({
    description: 'Message data payload',
    type: MessageDataDto,
  })
  @ValidateNested()
  @Type(() => MessageDataDto)
  data: MessageDataDto;

  @ApiProperty({
    description: 'Data content type',
    example: 'application/json',
  })
  @IsString()
  @IsNotEmpty()
  datacontenttype: string;

  @ApiProperty({
    description: 'Event ID',
    example: 'f4aed1d3-ab4f-42b9-b9dd-9fc7182f7197',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Event source',
    example: '/v1/messages/receive',
  })
  @IsString()
  @IsNotEmpty()
  source: string;

  @ApiProperty({
    description: 'CloudEvents spec version',
    example: '1.0',
  })
  @IsString()
  @IsNotEmpty()
  specversion: string;

  @ApiProperty({
    description: 'Event timestamp',
    example: '2023-06-29T03:21:19.524331882Z',
  })
  @IsDateString()
  time: string;

  @ApiProperty({
    description: 'Event type',
    enum: [
      'message.phone.received',
      'message.phone.sent',
      'message.phone.delivered',
      'message.send.failed',
      'message.send.expired',
      'message.call.missed',
      'phone.heartbeat.offline',
      'phone.heartbeat.online',
    ],
    example: 'message.phone.received',
  })
  @IsEnum([
    'message.phone.received',
    'message.phone.sent',
    'message.phone.delivered',
    'message.send.failed',
    'message.send.expired',
    'message.call.missed',
    'phone.heartbeat.offline',
    'phone.heartbeat.online',
  ])
  type:
    | 'message.phone.received'
    | 'message.phone.sent'
    | 'message.phone.delivered'
    | 'message.send.failed'
    | 'message.send.expired'
    | 'message.call.missed'
    | 'phone.heartbeat.offline'
    | 'phone.heartbeat.online';
}

export class SmsStatusQueryDto {
  @ApiProperty({
    description: 'Get detailed status information',
    example: true,
    required: false,
  })
  @IsOptional()
  detailed?: boolean;
}

export class SmsCheckDto {
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

  @ApiProperty({
    description: 'Phone number that sent the message',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class SmsReportDto {
  @ApiProperty({
    description: 'Type of scammer',
    enum: ScammerType,
    example: ScammerType.PHONE,
  })
  @IsEnum(ScammerType)
  type: ScammerType;

  @ApiProperty({
    description: 'Phone number or identifier',
    example: '+1234567890',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  identifier: string;

  @ApiProperty({
    description: 'Description of the scam attempt',
    example: 'This number sent me fake bank SMS asking for PIN',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 1000)
  description: string;

  @ApiProperty({
    description: 'Additional information',
    example: 'They pretended to be from my bank',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  additionalInfo?: string;
}

export class SmsStatsQueryDto {
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
