import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TelegramWebhookService } from './telegram-webhook.service';

import { TelegramModerationService } from './telegram-moderation.service';
import { PolicyGuard } from '../common/guards/policy.guard';
import { RequirePolicy } from '../common/decorators/policy.decorator';
import { Action, Resource } from '../common/interfaces/policy.interface';
import { Public } from '../common/decorators/public.decorator';

import { TelegramBotService } from './telegram-bot.service';
@ApiTags('telegram-bot')
@Controller('telegram')
export class TelegramBotController {
  constructor(
    private readonly botService: TelegramBotService,
    private readonly webhookService: TelegramWebhookService,
  ) {}
  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Telegram webhook updates' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(@Body() update: any): Promise<void> {
    await this.webhookService.handleWebhook(update);
  }
  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Check Telegram bot health status' })
  @ApiResponse({ status: 200, description: 'Bot health status' })
  async getHealthStatus(): Promise<{ status: string; timestamp: string }> {
    return { status: 'healthy', timestamp: new Date().toISOString() };
  }

  @Get('connectivity')
  @UseGuards(PolicyGuard)
  @RequirePolicy(Action.READ, Resource.BOT_SETTINGS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Test Telegram bot connectivity (Admin only)' })
  @ApiResponse({ status: 200, description: 'Bot connectivity test results' })
  async testConnectivity(): Promise<any> {
    return await this.botService.testBotConnectivity();
  }
}
