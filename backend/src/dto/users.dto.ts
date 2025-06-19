import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Length,
  IsEnum,
} from 'class-validator';

export class UserIdParamDto {
  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class UpdateUserDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'User role',
    enum: ['USER', 'MODERATOR', 'ADMIN'],
    example: 'USER',
    required: false,
  })
  @IsOptional()
  @IsEnum(['USER', 'MODERATOR', 'ADMIN'])
  role?: string;

  @ApiProperty({
    description: 'User status',
    enum: ['ACTIVE', 'INACTIVE', 'BANNED'],
    example: 'ACTIVE',
    required: false,
  })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'BANNED'])
  status?: string;
}
