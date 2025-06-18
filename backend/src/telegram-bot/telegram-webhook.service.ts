import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegramConfig } from '../common/interfaces/config.interface';
import { TelegramBotService } from './telegram-bot.service';

@Injectable()
export class TelegramWebhookService {
  private readonly logger = new Logger(TelegramWebhookService.name);
  private config: TelegramConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly botService: TelegramBotService,
  ) {
    const telegramConfig = this.configService.get<TelegramConfig>('telegram');
    if (!telegramConfig) {
      throw new Error('Telegram configuration is required');
    }
    this.config = telegramConfig;
  }

  async setupWebhook(): Promise<void> {
    if (!this.config.webhookUrl || !this.config.botToken) {
      this.logger.warn(
        'Webhook URL or bot token not configured. Skipping webhook setup.',
      );
      return;
    }

    try {
      const bot = this.botService.getBotInstance();
      if (!bot) {
        this.logger.warn('Bot instance not available. Cannot setup webhook.');
        return;
      }

      // Set webhook
      await bot.telegram.setWebhook(this.config.webhookUrl);
      this.logger.log(`Webhook set to: ${this.config.webhookUrl}`);

      // Get webhook info to verify
      const webhookInfo = await bot.telegram.getWebhookInfo();
      this.logger.log('Webhook info:', webhookInfo);
    } catch (error) {
      this.logger.error('Failed to setup webhook:', error);
    }
  }

  async removeWebhook(): Promise<void> {
    try {
      const bot = this.botService.getBotInstance();
      if (!bot) return;

      await bot.telegram.deleteWebhook();
      this.logger.log('Webhook removed');
    } catch (error) {
      this.logger.error('Failed to remove webhook:', error);
    }
  }

  async handleWebhook(update: any): Promise<void> {
    try {
      const bot = this.botService.getBotInstance();
      if (!bot) {
        this.logger.warn('Bot instance not available. Cannot handle webhook.');
        return;
      }

      // Process the update
      await bot.handleUpdate(update);
    } catch (error) {
      this.logger.error('Failed to handle webhook update:', error);
    }
  }
}
