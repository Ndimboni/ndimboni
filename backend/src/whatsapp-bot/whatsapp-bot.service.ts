import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScamReport } from '../entities/scam-report.entity';
import { User } from '../entities/user.entity';
import { ScamCheckService } from '../scam-check/scam-check.service';
import { WhatsappApiService } from './whatsapp-api.service';
import { ScamAnalysisFormatterService } from '../common/services/scam-analysis-formatter.service';
import { ScammerReportService } from '../scammer-reports/scammer-report.service';
import { RankingService } from '../scam-check/risk-score-ranking.service';

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
    private rankingService: RankingService,
  ) {}

  async handleIncomingMessage(message: any): Promise<string> {
    this.logger.log(`Received WhatsApp message: ${JSON.stringify(message)}`);
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

    if (
      text.trim().toLowerCase().includes('/report') ||
      text.trim().toLowerCase().includes('/scam') ||
      text.trim().toLowerCase().includes('/raporo')
    ) {
      const description = text.slice(7).trim();

      try {
        // Create a scam report first (consistent with Telegram bot)
        const scamReport = this.scamReportRepository.create({
          title: 'WhatsApp Report',
          description: description || 'WhatsApp scam report',
          status: 'pending' as any,
          scamType: 'other' as any,
          reporterPhone: waId,
          additionalInfo: JSON.stringify({
            reporterPhone: waId,
            source: 'whatsapp',
            originalMessage: text,
          }),
        } as Partial<ScamReport>);

        const savedScamReport =
          await this.scamReportRepository.save(scamReport);
        this.logger.log(`WhatsApp scam report created: ${savedScamReport.id}`);

        try {
          const extractionResult =
            await this.rankingService.extractAndSaveScammerIdentifiers(
              description || text,
              savedScamReport.id,
              'whatsapp',
              waId,
            );

          this.logger.log(
            `Extracted ${extractionResult.extractedCount} scammer identifiers from WhatsApp report ${savedScamReport.id}`,
          );

          if (extractionResult.extractedCount > 0) {
            this.logger.log(
              `Saved scammer reports: ${extractionResult.savedReports
                .map((r) => `${r.type}:${r.identifier}`)
                .join(', ')}`,
            );
          }
        } catch (extractionError) {
          this.logger.warn(
            `Failed to extract scammer identifiers from WhatsApp report ${savedScamReport.id}:`,
            extractionError,
          );
          // Don't fail the entire operation if extraction fails
        }

        reply = this.scamAnalysisFormatterService.formatReportSuccessResponse(
          savedScamReport.id,
          'whatsapp',
        );
        await this.whatsappApiService.sendMessage(waId, reply);
        return reply;
      } catch (error) {
        this.logger.error('Error creating WhatsApp scam report:', error);
        reply =
          '❌ Sorry, there was an error submitting your report. Please try again later.';
        await this.whatsappApiService.sendMessage(waId, reply);
        return reply;
      }
    }

    const result = await this.scamCheckService.checkMessage({
      message: text,
      source: 'whatsapp',
    });

    reply = this.scamAnalysisFormatterService.formatScamAnalysisResponse(
      text,
      result,
      'whatsapp',
    );
    await this.whatsappApiService.sendMessage(waId, reply);
    return reply;
  }
}
