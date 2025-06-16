import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramWebhookService } from './telegram-webhook.service';
import { TelegramModerationService } from './telegram-moderation.service';
import { PolicyGuard } from '../guards/policy.guard';
import { RequirePolicy } from '../decorators/policy.decorator';
import { Action, Resource } from '../common/interfaces/policy.interface';
import { Public } from '../decorators/public.decorator';

@ApiTags('telegram-bot')
@Controller('telegram')
export class TelegramBotController {
  constructor(
    private readonly botService: TelegramBotService,
    private readonly webhookService: TelegramWebhookService,
    private readonly moderationService: TelegramModerationService,
  ) {}

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Telegram webhook updates' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(@Body() update: any): Promise<void> {
    await this.webhookService.handleWebhook(update);
  }

  @Post('setup-webhook')
  @UseGuards(PolicyGuard)
  @RequirePolicy(Action.UPDATE, Resource.BOT_SETTINGS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Setup Telegram webhook (Admin only)' })
  @ApiResponse({ status: 200, description: 'Webhook setup initiated' })
  async setupWebhook(): Promise<{ message: string }> {
    await this.webhookService.setupWebhook();
    return { message: 'Webhook setup initiated' };
  }

  @Post('remove-webhook')
  @UseGuards(PolicyGuard)
  @RequirePolicy(Action.UPDATE, Resource.BOT_SETTINGS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove Telegram webhook (Admin only)' })
  @ApiResponse({ status: 200, description: 'Webhook removed' })
  async removeWebhook(): Promise<{ message: string }> {
    await this.webhookService.removeWebhook();
    return { message: 'Webhook removed' };
  }

  @Post('analyze-message')
  @UseGuards(PolicyGuard)
  @RequirePolicy(Action.READ, Resource.SCAM_REPORT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Analyze a message for scam content' })
  @ApiResponse({ status: 200, description: 'Message analysis results' })
  async analyzeMessage(@Body() body: { message: string }): Promise<any> {
    const result = await this.moderationService.analyzeMessage(body.message);
    return {
      analysis: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('bot-info')
  @UseGuards(PolicyGuard)
  @RequirePolicy(Action.READ, Resource.BOT_SETTINGS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Telegram bot information (Admin only)' })
  @ApiResponse({ status: 200, description: 'Bot information' })
  async getBotInfo(): Promise<any> {
    const bot = this.botService.getBotInstance();
    if (!bot) {
      return { status: 'Bot not configured or started' };
    }

    try {
      const botInfo = await bot.telegram.getMe();
      const webhookInfo = await bot.telegram.getWebhookInfo();

      return {
        bot: botInfo,
        webhook: webhookInfo,
        status: 'active',
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Check Telegram bot health status' })
  @ApiResponse({ status: 200, description: 'Bot health status' })
  async getHealthStatus(): Promise<{ status: string; timestamp: string }> {
    const bot = this.botService.getBotInstance();
    const status = bot ? 'healthy' : 'not_configured';

    return {
      status,
      timestamp: new Date().toISOString(),
    };
  }
}
