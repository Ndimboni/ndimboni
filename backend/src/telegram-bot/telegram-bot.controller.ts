import {
  Controller,
  Post,
  Body,
  Get,
  Query,
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
import { ScamCheckService } from '../scam-check/scam-check.service';
import { ScammerReportService } from '../scammer-reports/scammer-report.service';
import {
  TelegramCheckDto,
  TelegramReportDto,
  TelegramStatsQueryDto,
} from '../dto/telegram-bot.dto';

@ApiTags('telegram-bot')
@Controller('telegram')
export class TelegramBotController {
  constructor(
    private readonly botService: TelegramBotService,
    private readonly webhookService: TelegramWebhookService,
    private readonly scamCheckService: ScamCheckService,
    private readonly scammerReportService: ScammerReportService,
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

  @Public()
  @Post('check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check message for scam patterns via Telegram' })
  @ApiResponse({ status: 200, description: 'Message checked successfully' })
  async checkMessage(@Body() dto: TelegramCheckDto): Promise<any> {
    const result = await this.scamCheckService.checkMessage({
      message: dto.message,
      source: 'telegram',
    });

    return {
      success: true,
      data: result,
      message: 'Message checked successfully',
    };
  }

  @Public()
  @Post('report')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Report a scammer via Telegram' })
  @ApiResponse({ status: 200, description: 'Scammer reported successfully' })
  async reportScammer(@Body() dto: TelegramReportDto): Promise<any> {
    const result = await this.scammerReportService.createReport({
      type: dto.type,
      identifier: dto.identifier,
      description: dto.description,
      additionalInfo: dto.additionalInfo,
      source: 'telegram',
    });

    return {
      success: true,
      data: result,
      message: 'Scammer reported successfully',
    };
  }

  @Public()
  @Get('stats')
  @ApiOperation({ summary: 'Get Telegram bot usage statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStats(@Query() dto: TelegramStatsQueryDto): Promise<any> {
    const [checkStats, reportStats] = await Promise.all([
      this.scamCheckService.getStats(dto.days),
      this.scammerReportService.getStats(),
    ]);

    // Filter stats by source to only include Telegram-originated data
    const telegramCheckStats = {
      ...checkStats,
      recentChecks: checkStats.recentChecks.filter(
        (check) => check.source === 'telegram',
      ),
    };

    const telegramReportStats = {
      ...reportStats,
      recentReports: reportStats.recentReports.filter(
        (report) => report.source === 'telegram',
      ),
      topScammers: reportStats.topScammers.filter(
        (report) => report.source === 'telegram',
      ),
    };

    return {
      success: true,
      data: {
        checks: telegramCheckStats,
        reports: telegramReportStats,
        period: `${dto.days} days`,
      },
      message: 'Statistics retrieved successfully',
    };
  }
}
