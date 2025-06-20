import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ScamCheckService } from '../scam-check/scam-check.service';
import { ScammerReportService } from '../scammer-reports/scammer-report.service';
import { ScammerType } from '../entities/scammer-report.entity';

export interface HttpSmsConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  phoneNumber: string; // Your HTTP SMS phone number
}

export interface SmsWebhookPayload {
  id: string;
  owner: string;
  contact: string;
  content: string;
  timestamp: string;
  sim: string;
  received_at: string;
  type: 'received' | 'sent';
}

export interface SmsResponse {
  success: boolean;
  message: string;
}

@Injectable()
export class HttpSmsService {
  private readonly logger = new Logger(HttpSmsService.name);
  private config: HttpSmsConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly scamCheckService: ScamCheckService,
    private readonly scammerReportService: ScammerReportService,
  ) {
    this.config = {
      apiKey: this.configService.get<string>('HTTP_SMS_API_KEY') || '',
      apiSecret: this.configService.get<string>('HTTP_SMS_API_SECRET') || '',
      baseUrl:
        this.configService.get<string>('HTTP_SMS_BASE_URL') ||
        'https://api.httpsms.com',
      phoneNumber:
        this.configService.get<string>('HTTP_SMS_PHONE_NUMBER') || '',
    };

    if (!this.config.apiKey || !this.config.apiSecret) {
      this.logger.warn(
        'HTTP SMS API credentials not configured. SMS functionality will be disabled.',
      );
    }
  }

  /**
   * Handle incoming SMS webhook from HTTP SMS
   */
  async handleSmsWebhook(payload: SmsWebhookPayload): Promise<SmsResponse> {
    try {
      this.logger.log(
        `Received SMS from ${payload.contact}: ${payload.content}`,
      );

      // Parse the SMS content to determine the action
      const content = payload.content.trim().toLowerCase();

      if (content.startsWith('/check ') || content.startsWith('check ')) {
        return await this.handleCheckCommand(payload);
      } else if (
        content.startsWith('/report ') ||
        content.startsWith('report ')
      ) {
        return await this.handleReportCommand(payload);
      } else if (content === '/help' || content === 'help') {
        return await this.handleHelpCommand(payload);
      } else {
        // Default: analyze the message for scam patterns
        return await this.handleMessageAnalysis(payload);
      }
    } catch (error) {
      this.logger.error('Error handling SMS webhook:', error);
      await this.sendSms(
        payload.contact,
        '❌ Sorry, there was an error processing your message. Please try again later.',
      );
      return {
        success: false,
        message: 'Error processing SMS',
      };
    }
  }

  /**
   * Handle /check command via SMS
   */
  private async handleCheckCommand(
    payload: SmsWebhookPayload,
  ): Promise<SmsResponse> {
    const message = payload.content.replace(/^(\/)?check\s+/i, '').trim();

    if (!message) {
      await this.sendSms(
        payload.contact,
        '❌ Please provide a message to check.\nExample: CHECK Is this website legitimate? www.example.com',
      );
      return { success: false, message: 'No message provided' };
    }

    try {
      const result = await this.scamCheckService.checkMessage({
        message,
        source: 'sms',
        ipAddress: payload.contact, // Use phone number as identifier
      });

      let statusEmoji = '';
      let statusText = '';

      switch (result.status) {
        case 'safe':
          statusEmoji = '✅';
          statusText = 'SAFE';
          break;
        case 'suspicious':
          statusEmoji = '⚠️';
          statusText = 'SUSPICIOUS';
          break;
        case 'malicious':
          statusEmoji = '🚨';
          statusText = 'DANGEROUS';
          break;
        default:
          statusEmoji = '❓';
          statusText = 'UNKNOWN';
      }

      const responseMessage = `${statusEmoji} RESULT: ${statusText}
Risk Score: ${Math.round(result.riskScore * 100)}%
Confidence: ${Math.round(result.confidence * 100)}%

${result.reasons.length > 0 ? 'Reasons: ' + result.reasons.join(', ') : ''}

Reply HELP for more commands.`;

      await this.sendSms(payload.contact, responseMessage);

      return { success: true, message: 'Check completed' };
    } catch (error) {
      this.logger.error('Error performing scam check:', error);
      await this.sendSms(
        payload.contact,
        '❌ Error analyzing message. Please try again later.',
      );
      return { success: false, message: 'Check failed' };
    }
  }

  /**
   * Handle /report command via SMS
   */
  private async handleReportCommand(
    payload: SmsWebhookPayload,
  ): Promise<SmsResponse> {
    const content = payload.content.replace(/^(\/)?report\s+/i, '').trim();

    if (!content) {
      await this.sendSms(
        payload.contact,
        '❌ Please provide details about the scammer.\nExample: REPORT EMAIL scammer@fake.com They tried to steal my banking details',
      );
      return { success: false, message: 'No report details provided' };
    }

    try {
      // Parse the report format: TYPE identifier description
      const parts = content.split(' ');
      if (parts.length < 3) {
        await this.sendSms(
          payload.contact,
          '❌ Invalid format. Use: REPORT TYPE identifier description\nTypes: EMAIL, PHONE, SOCIAL_MEDIA, WEBSITE, OTHER',
        );
        return { success: false, message: 'Invalid format' };
      }

      const typeStr = parts[0].toUpperCase();
      const identifier = parts[1];
      const description = parts.slice(2).join(' ');

      // Map string to ScammerType enum
      let type: ScammerType;
      switch (typeStr) {
        case 'EMAIL':
          type = ScammerType.EMAIL;
          break;
        case 'PHONE':
          type = ScammerType.PHONE;
          break;
        case 'SOCIAL_MEDIA':
        case 'SOCIAL':
          type = ScammerType.SOCIAL_MEDIA;
          break;
        case 'WEBSITE':
        case 'WEB':
          type = ScammerType.WEBSITE;
          break;
        default:
          type = ScammerType.OTHER;
      }

      const result = await this.scammerReportService.createReport({
        type,
        identifier,
        description,
        source: 'sms',
        additionalInfo: `Reported via SMS from ${payload.contact}`,
      });

      await this.sendSms(
        payload.contact,
        `✅ Thank you for reporting this scammer!
Report ID: ${result.id}
Type: ${type}
Identifier: ${identifier}

Your report helps protect others from scams. Reply HELP for more commands.`,
      );

      return { success: true, message: 'Report created' };
    } catch (error) {
      this.logger.error('Error creating scammer report:', error);
      await this.sendSms(
        payload.contact,
        '❌ Error creating report. Please try again later.',
      );
      return { success: false, message: 'Report failed' };
    }
  }

  /**
   * Handle help command via SMS
   */
  private async handleHelpCommand(
    payload: SmsWebhookPayload,
  ): Promise<SmsResponse> {
    const helpMessage = `📱 Ndimboni SMS Commands:

CHECK <message> - Analyze text for scam patterns
REPORT <type> <identifier> <description> - Report a scammer

Types: EMAIL, PHONE, SOCIAL_MEDIA, WEBSITE, OTHER

Examples:
• CHECK Is this website safe? example.com
• REPORT EMAIL fake@scam.com They asked for my password

Just send any suspicious message and we'll analyze it automatically.

🔒 Together, we're making the digital world safer!`;

    await this.sendSms(payload.contact, helpMessage);
    return { success: true, message: 'Help sent' };
  }

  /**
   * Handle general message analysis via SMS
   */
  private async handleMessageAnalysis(
    payload: SmsWebhookPayload,
  ): Promise<SmsResponse> {
    try {
      const result = await this.scamCheckService.checkMessage({
        message: payload.content,
        source: 'sms',
        ipAddress: payload.contact,
      });

      let responseMessage = '';

      if (result.riskScore > 0.5) {
        responseMessage = `🚨 WARNING: This message shows signs of being a scam!

Risk Score: ${Math.round(result.riskScore * 100)}%
Confidence: ${Math.round(result.confidence * 100)}%

${result.reasons.length > 0 ? 'Red flags: ' + result.reasons.slice(0, 3).join(', ') : ''}

Reply CHECK <message> for detailed analysis or HELP for commands.`;
      } else {
        responseMessage = `✅ This message appears to be safe.

Risk Score: ${Math.round(result.riskScore * 100)}%

Reply CHECK <message> for detailed analysis or HELP for commands.`;
      }

      await this.sendSms(payload.contact, responseMessage);
      return { success: true, message: 'Analysis completed' };
    } catch (error) {
      this.logger.error('Error analyzing message:', error);
      await this.sendSms(
        payload.contact,
        '❌ Error analyzing message. Reply HELP for commands.',
      );
      return { success: false, message: 'Analysis failed' };
    }
  }

  /**
   * Send SMS using HTTP SMS API
   */
  private async sendSms(to: string, content: string): Promise<void> {
    if (!this.config.apiKey || !this.config.apiSecret) {
      this.logger.warn('HTTP SMS not configured, cannot send SMS');
      return;
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/v1/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'x-api-secret': this.config.apiSecret,
        },
        body: JSON.stringify({
          content,
          from: this.config.phoneNumber,
          to,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `HTTP SMS API error: ${response.status} ${response.statusText}`,
        );
      }

      const result = await response.json();
      this.logger.log(`SMS sent successfully to ${to}: ${result.id}`);
    } catch (error) {
      this.logger.error(`Error sending SMS to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Get SMS service status
   */
  async getStatus(): Promise<{ configured: boolean; phoneNumber: string }> {
    return {
      configured: !!(
        this.config.apiKey &&
        this.config.apiSecret &&
        this.config.phoneNumber
      ),
      phoneNumber: this.config.phoneNumber,
    };
  }
}
