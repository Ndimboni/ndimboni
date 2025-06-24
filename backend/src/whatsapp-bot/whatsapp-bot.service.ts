import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScamReport } from '../entities/scam-report.entity';
import { User } from '../entities/user.entity';
import { ScamCheckService } from '../scam-check/scam-check.service';
import { WhatsappApiService } from './whatsapp-api.service';
import { ScamAnalysisFormatterService } from '../common/services/scam-analysis-formatter.service';
import { ScammerReportService } from '../scammer-reports/scammer-report.service';
import { ScammerType } from '../entities/scammer-report.entity';

@Injectable()
export class WhatsappBotService {
  private readonly logger = new Logger(WhatsappBotService.name);

  constructor(
    @InjectRepository(ScamReport)
    private scamReportRepository: Repository<ScamReport>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private scamCheckService: ScamCheckService,
    private whatsappApiService: WhatsappApiService,
    private scamAnalysisFormatterService: ScamAnalysisFormatterService,
    private scammerReportService: ScammerReportService,
  ) {}

  async handleIncomingMessage(message: any): Promise<string> {
    this.logger.log(`Received WhatsApp message: ${JSON.stringify(message)}`);
    // Extract message text and sender from WhatsApp webhook payload
    let text = '';
    let waId = '';
    if (
      message.entry &&
      Array.isArray(message.entry) &&
      message.entry[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body
    ) {
      text = message.entry[0].changes[0].value.messages[0].text.body;
      waId = message.entry[0].changes[0].value.messages[0].from;
    } else if (message.body && message.from) {
      text = message.body;
      waId = message.from;
    } else {
      this.logger.error(
        'No message text or sender found in WhatsApp webhook payload',
      );
      throw new Error(
        'No message text or sender found in WhatsApp webhook payload',
      );
    }

    // Respond to greetings
    const greetings = ['hi', 'hello', 'muraho', 'salut', 'hey'];
    let reply = '';
    if (greetings.includes(text.trim().toLowerCase())) {
      reply =
        this.scamAnalysisFormatterService.formatGreetingResponse('whatsapp');
      await this.whatsappApiService.sendMessage(waId, reply);
      return reply;
    }

    // If user wants to report a scam (simple keyword-based trigger, e.g. starts with 'report:')
    if (
      text.trim().toLowerCase().includes('/report') ||
      text.trim().toLowerCase().includes('/scam')
    ) {
      const description = text.slice(7).trim();

      // Use ScammerReportService instead of direct repository
      const result = await this.scammerReportService.createReport({
        type: ScammerType.PHONE, // Assuming phone number reports from WhatsApp
        identifier: waId,
        description: description || 'WhatsApp scam report',
        additionalInfo: `Reported via WhatsApp from ${waId}`,
        source: 'whatsapp',
      });

      reply = this.scamAnalysisFormatterService.formatReportSuccessResponse(
        result.id,
        'whatsapp',
      );
      await this.whatsappApiService.sendMessage(waId, reply);
      return reply;
    }

    // Scam check for all other messages
    const result = await this.scamCheckService.checkMessage({
      message: text,
      source: 'whatsapp',
    });

    // Use shared formatter for analysis response
    reply = this.scamAnalysisFormatterService.formatScamAnalysisResponse(
      text,
      result,
      'whatsapp',
    );
    await this.whatsappApiService.sendMessage(waId, reply);
    return reply;
  }
}
