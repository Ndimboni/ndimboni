import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SmsService } from './sms.service';
import { SendEmailDto } from '../dto/email.dto';
import { PolicyGuard } from '../guards/policy.guard';
import { RequirePolicy } from '../decorators/policy.decorator';
import { Action, Resource } from '../common/interfaces/policy.interface';

@ApiTags('email-service')
@Controller('email')
@UseGuards(PolicyGuard) // JWT guard is now global, only need policy guard
@ApiBearerAuth()
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send')
  @RequirePolicy(Action.CREATE, Resource.EMAIL)
  @ApiOperation({ summary: 'Send email' })
  @ApiResponse({ status: 201, description: 'Email sent successfully' })
  @ApiResponse({ status: 400, description: 'Failed to send email' })
  async sendEmail(@Body() sendEmailDto: SendEmailDto) {
    return this.smsService.sendEmail(sendEmailDto);
  }

  @Post('send-welcome')
  @RequirePolicy(Action.CREATE, Resource.EMAIL)
  @ApiOperation({ summary: 'Send welcome email' })
  @ApiResponse({ status: 201, description: 'Welcome email sent successfully' })
  async sendWelcomeEmail(@Body() body: { to: string; name: string }) {
    return this.smsService.sendWelcomeEmail(body.to, body.name);
  }

  @Post('send-scam-alert')
  @RequirePolicy(Action.CREATE, Resource.EMAIL)
  @ApiOperation({ summary: 'Send scam alert email' })
  @ApiResponse({
    status: 201,
    description: 'Scam alert email sent successfully',
  })
  async sendScamAlert(@Body() body: { to: string; scamDetails: any }) {
    return this.smsService.sendScamAlertEmail(body.to, body.scamDetails);
  }

  @Post('send-bulk')
  @RequirePolicy(Action.CREATE, Resource.EMAIL)
  @ApiOperation({ summary: 'Send bulk emails' })
  @ApiResponse({ status: 201, description: 'Bulk emails sent successfully' })
  async sendBulkEmail(
    @Body()
    body: {
      recipients: string[];
      subject: string;
      message: string;
      format?: 'text' | 'html';
    },
  ) {
    return this.smsService.sendBulkEmail(
      body.recipients,
      body.subject,
      body.message,
      body.format,
    );
  }

  @Get('verify-config')
  @RequirePolicy(Action.READ, Resource.EMAIL)
  @ApiOperation({ summary: 'Verify email configuration' })
  @ApiResponse({ status: 200, description: 'Email configuration status' })
  async verifyEmailConfig() {
    const isValid = await this.smsService.verifyEmailConfiguration();
    return {
      valid: isValid,
      message: isValid
        ? 'Email configuration is valid'
        : 'Email configuration is invalid',
    };
  }
}
