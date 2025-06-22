import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WhatsappApiService {
  private readonly logger = new Logger(WhatsappApiService.name);
  // Use latest WhatsApp Cloud API version (v19.0 as of June 2025)
  private readonly apiVersion = process.env.WHATSAPP_API_VERSION || 'v19.0';
  private readonly apiUrl = `https://graph.facebook.com/${this.apiVersion}`;
  private readonly token = process.env.WHATSAPP_BOT_TOKEN;
  private readonly phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  async sendMessage(to: string, text: string): Promise<void> {
    if (!this.token || !this.phoneNumberId) {
      this.logger.error('WhatsApp API credentials are missing');
      return;
    }
    try {
      await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: {
            body: text,
            preview_url: false,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      this.logger.log(`Sent WhatsApp message to ${to}`);
    } catch (error) {
      this.logger.error('Failed to send WhatsApp message', error);
    }
  }
}
