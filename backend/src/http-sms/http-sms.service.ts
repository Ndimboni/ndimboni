import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { ScamCheckService } from '../scam-check/scam-check.service';
import { ScammerReportService } from '../scammer-reports/scammer-report.service';
import { ScammerType } from '../entities/scammer-report.entity';
import { HttpSmsWebhookDto } from '../dto/http-sms.dto';

export interface HttpSmsConfig {
  signingKey: string;
  phoneNumber: string;
}

export interface SmsResponse {
  success: boolean;
  message: string;
  data?: any;
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
      signingKey: this.configService.get<string>('HTTP_SMS_SIGNING_KEY') || '',
      phoneNumber:
        this.configService.get<string>('HTTP_SMS_PHONE_NUMBER') || '',
    };

    if (!this.config.signingKey) {
      this.logger.warn(
        'HTTP SMS signing key not configured. Webhook signature validation will be disabled.',
      );
    }
  }

  validateWebhookSignature(authHeader: string): boolean {
    if (!this.config.signingKey) {
      this.logger.warn('Signing key not configured, skipping validation');
      return true;
    }

    try {
      const token = authHeader.replace('Bearer ', '');
      jwt.verify(token, this.config.signingKey, { algorithms: ['HS256'] });
      return true;
    } catch (error) {
      this.logger.error('JWT signature validation failed:', error.message);
      return false;
    }
  }

  async handleWebhook(
    payload: HttpSmsWebhookDto,
    authHeader?: string,
  ): Promise<SmsResponse> {
    try {
      if (authHeader && !this.validateWebhookSignature(authHeader)) {
        throw new UnauthorizedException('Invalid webhook signature');
      }

      this.logger.log(
        `Received webhook event: ${payload.type} from ${payload.data.contact}`,
      );

      if (payload.type === 'message.phone.received') {
        return await this.handleReceivedMessage(payload);
      }

      this.logger.log(`Ignoring event type: ${payload.type}`);
      return {
        success: true,
        message: `Event ${payload.type} acknowledged but not processed`,
      };
    } catch (error) {
      this.logger.error('Error handling webhook:', error);
      return { success: false, message: 'Error processing webhook' };
    }
  }

  private async handleReceivedMessage(
    payload: HttpSmsWebhookDto,
  ): Promise<SmsResponse> {
    const { data } = payload;
    const messageContent = data.content.trim();

    this.logger.log(
      `Processing SMS from ${data.contact}: ${messageContent.substring(0, 100)}...`,
    );

    try {
      if (messageContent.toLowerCase().startsWith('check ')) {
        return await this.handleCheckCommand(payload);
      } else if (messageContent.toLowerCase().startsWith('report ')) {
        return await this.handleReportCommand(payload);
      } else if (messageContent.toLowerCase() === 'stats') {
        return await this.handleStatsCommand(payload);
      } else {
        return await this.analyzeMessage(payload);
      }
    } catch (error) {
      this.logger.error('Error processing received message:', error);
      return { success: false, message: 'Error processing message' };
    }
  }

  private async handleCheckCommand(
    payload: HttpSmsWebhookDto,
  ): Promise<SmsResponse> {
    const messageToCheck = payload.data.content
      .replace(/^check\s+/i, '')
      .trim();

    if (!messageToCheck) {
      const helpMessage = 'Usage: CHECK [message]';
      await this.sendHelpResponse(payload.data.contact, helpMessage);
      return { success: true, message: 'Check command help sent' };
    }

    const checkResult = await this.scamCheckService.checkMessage({
      message: messageToCheck,
      source: 'sms',
      ipAddress: payload.data.contact,
    });

    await this.sendCheckResponse(payload.data.contact, checkResult);

    return {
      success: true,
      message: 'Check command processed',
      data: checkResult,
    };
  }

  private async handleReportCommand(
    payload: HttpSmsWebhookDto,
  ): Promise<SmsResponse> {
    const reportData = payload.data.content.replace(/^report\s+/i, '').trim();

    if (!reportData) {
      const helpMessage = 'Usage: REPORT [type] [identifier] [description]';
      await this.sendHelpResponse(payload.data.contact, helpMessage);
      return { success: true, message: 'Report command help sent' };
    }

    const parts = reportData.split(' ');
    if (parts.length < 3) {
      await this.sendHelpResponse(
        payload.data.contact,
        'Invalid format. Use: REPORT [type] [identifier] [description]',
      );
      return { success: false, message: 'Invalid report format' };
    }

    const type = parts[0].toUpperCase() as ScammerType;
    const identifier = parts[1];
    const description = parts.slice(2).join(' ');

    if (!Object.values(ScammerType).includes(type)) {
      await this.sendHelpResponse(
        payload.data.contact,
        'Invalid type. Use: PHONE, EMAIL, WEBSITE, or OTHER',
      );
      return { success: false, message: 'Invalid scammer type' };
    }

    const report = await this.scammerReportService.createReport({
      type,
      identifier,
      description,
      reportedBy: payload.data.contact,
      source: 'sms',
    });

    const successMessage = `Report submitted successfully! ID: ${report.id}`;
    await this.sendHelpResponse(payload.data.contact, successMessage);

    return {
      success: true,
      message: 'Report command processed',
      data: report,
    };
  }

  private async handleStatsCommand(
    payload: HttpSmsWebhookDto,
  ): Promise<SmsResponse> {
    const stats = await this.getStats(7);

    const statsMessage = `Stats (7 days): Checks: ${stats.checks.totalChecks}, Reports: ${stats.reports.totalReports}`;
    await this.sendHelpResponse(payload.data.contact, statsMessage);

    return {
      success: true,
      message: 'Stats command processed',
      data: stats,
    };
  }

  private async analyzeMessage(
    payload: HttpSmsWebhookDto,
  ): Promise<SmsResponse> {
    const checkResult = await this.scamCheckService.checkMessage({
      message: payload.data.content,
      source: 'sms',
      ipAddress: payload.data.contact,
    });

    if (['suspicious', 'malicious'].includes(checkResult.status)) {
      await this.sendCheckResponse(payload.data.contact, checkResult);
    }

    return {
      success: true,
      message: 'Message analyzed',
      data: checkResult,
    };
  }

  async checkMessage(dto: {
    message: string;
    phoneNumber?: string;
  }): Promise<any> {
    return await this.scamCheckService.checkMessage({
      message: dto.message,
      source: 'sms',
      ipAddress: dto.phoneNumber,
    });
  }

  async reportScammer(dto: {
    type: ScammerType;
    identifier: string;
    description: string;
    additionalInfo?: string;
  }): Promise<any> {
    return await this.scammerReportService.createReport({
      type: dto.type,
      identifier: dto.identifier,
      description: dto.description,
      additionalInfo: dto.additionalInfo,
      reportedBy: 'sms-user',
      source: 'sms',
    });
  }

  async getStats(days: number = 30): Promise<any> {
    const [checkStats, reportStats] = await Promise.all([
      this.scamCheckService.getStats(days),
      this.scammerReportService.getStats(),
    ]);

    return {
      checks: {
        ...checkStats,
        recentChecks:
          checkStats.recentChecks?.filter((check) => check.source === 'sms') ||
          [],
      },
      reports: {
        ...reportStats,
        recentReports:
          reportStats.recentReports?.filter(
            (report) => report.source === 'sms',
          ) || [],
      },
      period: `${days} days`,
    };
  }

  private async sendCheckResponse(
    phoneNumber: string,
    analysis: any,
  ): Promise<void> {
    try {
      let responseMessage = '';

      if (analysis.status === 'malicious') {
        responseMessage = `SCAM ALERT: This message is DANGEROUS (${Math.round(analysis.riskScore * 100)}% confidence).`;
      } else if (analysis.status === 'suspicious') {
        responseMessage = `SUSPICIOUS: This message needs caution (${Math.round(analysis.riskScore * 100)}% confidence).`;
      } else {
        responseMessage = `Message checked. Status: ${analysis.status}`;
      }

      if (analysis.reasons && analysis.reasons.length > 0) {
        responseMessage += ` Detected: ${analysis.reasons.join(', ')}`;
      }

      await this.sendHelpResponse(phoneNumber, responseMessage);
    } catch (error) {
      this.logger.error('Error sending check response:', error);
    }
  }

  private async sendHelpResponse(
    phoneNumber: string,
    message: string,
  ): Promise<void> {
    this.logger.log(`[SMS RESPONSE to ${phoneNumber}]: ${message}`);
    // TODO: Implement actual SMS sending using HTTP SMS API
  }

  async getServiceInfo(): Promise<any> {
    return {
      name: 'HTTP SMS Service',
      version: '1.0.0',
      status: 'active',
      webhookUrl: '/sms/webhook',
      supportedCommands: ['check', 'report', 'stats'],
      config: {
        hasSigningKey: !!this.config.signingKey,
        phoneNumber: this.config.phoneNumber || 'not configured',
      },
    };
  }
}
