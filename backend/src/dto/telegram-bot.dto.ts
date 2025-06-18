import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

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
