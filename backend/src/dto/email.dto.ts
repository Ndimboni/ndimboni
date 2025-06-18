import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'Recipient email address',
  })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  to: string;

  @ApiProperty({ example: 'Welcome to Ndimboni', description: 'Email subject' })
  @IsString({ message: 'Subject must be a string' })
  @IsNotEmpty({ message: 'Subject is required' })
  subject: string;

  @ApiProperty({
    example: 'Thank you for joining Ndimboni!',
    description: 'Email message',
  })
  @IsString({ message: 'Message must be a string' })
  @IsNotEmpty({ message: 'Message is required' })
  message: string;

  @ApiProperty({
    example: 'text',
    description: 'Email format (text or html)',
    enum: ['text', 'html'],
    required: false,
  })
  @IsString({ message: 'Format must be a string' })
  @IsOptional()
  format?: 'text' | 'html' = 'text';
}
