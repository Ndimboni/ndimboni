import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScamReport } from '../entities/scam-report.entity';
import { User } from '../entities/user.entity';
import { ScamCheckService } from '../scam-check/scam-check.service';
import { WhatsappApiService } from './whatsapp-api.service';

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
        '🤖 Ndimboni Digital Scam Protection Bot Capabilities\n\nYou can:\n• /report description — Report a scammer or scam incident\n• /check message — Check if a message might be a scam\n• /start — View welcome message and overview\n\nJust type your command or message!';
      await this.whatsappApiService.sendMessage(waId, reply);
      return reply;
    }

    // If user wants to report a scam (simple keyword-based trigger, e.g. starts with 'report:')
    if (text.trim().toLowerCase().startsWith('report:')) {
      // Extract report details (very basic, for demo)
      const description = text.slice(7).trim();
      const report = this.scamReportRepository.create({
        title: 'WhatsApp Report',
        description,
        status: 'pending', // Fix: use enum ScamStatus.PENDING
        scamType: 'other', // Fix: use enum ScamType.OTHER
        reporterPhone: waId,
      } as Partial<ScamReport>);
      const saved = await this.scamReportRepository.save(report);
      reply = `✅ Report Submitted Successfully!\n\n    Report ID: ${saved.id}\n    Status: Under Review\n\n    Thank you for helping protect others from scams. Our team will review your report and take appropriate action.\n\n    🛡️ Stay vigilant and keep reporting suspicious activity!`;
      await this.whatsappApiService.sendMessage(waId, reply);
      return reply;
    }

    // Scam check for all other messages
    const result = await this.scamCheckService.checkMessage({
      message: text,
      source: 'whatsapp',
    });
    // Format risk level
    let riskLabel = 'LOW RISK';
    if (result.riskScore >= 0.8) riskLabel = '⚠️ HIGH RISK';
    else if (result.riskScore >= 0.5) riskLabel = '⚠️ MEDIUM RISK';
    // Format risk score as percent
    const riskPercent = Math.round(result.riskScore * 100);
    // Recommendation
    let recommendation = 'Message appears relatively safe.';
    if (result.riskScore >= 0.8) {
      recommendation = 'This message is likely a scam. Do NOT engage.';
    } else if (result.riskScore >= 0.5) {
      recommendation = 'Be cautious. This message may be suspicious.';
    }
    reply = `🔍 Scam Analysis Results:\n\nMessage: "${text}"\n\n${result.riskScore < 0.5 ? '✅' : '⚠️'} ${riskLabel}\n\nRisk Score: ${riskPercent}%\nRecommendation: ${recommendation}`;
    await this.whatsappApiService.sendMessage(waId, reply);
    return reply;
  }
}
