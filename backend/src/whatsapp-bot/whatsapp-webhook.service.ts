import { Injectable, Logger } from '@nestjs/common';
import { WhatsappBotService } from './whatsapp-bot.service';

@Injectable()
export class WhatsappWebhookService {
  private readonly logger = new Logger(WhatsappWebhookService.name);

  constructor(private readonly whatsappBotService: WhatsappBotService) {}

  async processUpdate(update: any): Promise<string> {
    this.logger.log(
      `Processing WhatsApp webhook update: ${JSON.stringify(update)}`,
    );
    // Forward to bot service for handling
    return this.whatsappBotService.handleIncomingMessage(update);
  }
}
