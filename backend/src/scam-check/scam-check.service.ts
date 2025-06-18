import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import {
  ScamCheck,
  CheckStatus,
  IntentType,
} from '../entities/scam-check.entity';
import {
  UrlScanningService,
  ScanSummary,
} from '../services/url-scanning.service';
import { TelegramModerationService } from '../telegram-bot/telegram-moderation.service';

export interface ScamCheckRequest {
  message: string;
  checkedBy?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ScamCheckResponse {
  id: string;
  status: CheckStatus;
  detectedIntent: IntentType;
  riskScore: number;
  confidence: number;
  reasons: string[];
  detectedPatterns: string[];
  urlScanResults?: any;
  message: string;
  extractedUrls?: string[];
  createdAt: Date;
}

export interface ScamCheckStats {
  totalChecks: number;
  safeChecks: number;
  suspiciousChecks: number;
  maliciousChecks: number;
  unknownChecks: number;
  topIntents: { intent: IntentType; count: number }[];
  recentChecks: ScamCheckResponse[];
}

@Injectable()
export class ScamCheckService {
  private readonly logger = new Logger(ScamCheckService.name);

  constructor(
    @InjectRepository(ScamCheck)
    private readonly scamCheckRepository: Repository<ScamCheck>,
    private readonly urlScanningService: UrlScanningService,
    private readonly telegramModerationService: TelegramModerationService,
  ) {}

  async checkMessage(request: ScamCheckRequest): Promise<ScamCheckResponse> {
    try {
      this.logger.log(
        `Checking message: ${request.message.substring(0, 100)}...`,
      );

      // Extract URLs from the message
      const urlRegex = /(https?:\/\/[^\s]+)/gi;
      const extractedUrls = request.message.match(urlRegex) || [];

      // Analyze the message using Telegram moderation service
      const analysis = await this.telegramModerationService.analyzeMessage(
        request.message,
      );

      // Scan URLs if any found
      let urlScanResults: ScanSummary | null = null;
      let riskScore = analysis.confidence;

      if (extractedUrls.length > 0) {
        const scanSummary =
          await this.urlScanningService.scanUrls(extractedUrls);
        urlScanResults = scanSummary;

        // Adjust risk score based on URL scan results
        if (scanSummary.maliciousUrls > 0) {
          riskScore = Math.max(riskScore, 0.9);
          analysis.reasons.push('malicious_urls_detected');
        } else if (scanSummary.suspiciousUrls > 0) {
          riskScore = Math.max(riskScore, 0.6);
          analysis.reasons.push('suspicious_urls_detected');
        }
      }

      // Determine final status based on risk score
      let status: CheckStatus;
      if (riskScore >= 0.8) {
        status = CheckStatus.MALICIOUS;
      } else if (riskScore >= 0.5) {
        status = CheckStatus.SUSPICIOUS;
      } else if (riskScore > 0) {
        status = CheckStatus.SAFE;
      } else {
        status = CheckStatus.UNKNOWN;
      }

      // Determine intent based on analysis
      let detectedIntent = IntentType.UNKNOWN;
      if (analysis.isScam) {
        // Simple intent detection based on patterns
        const message = request.message.toLowerCase();
        if (message.includes('phish') || message.includes('login')) {
          detectedIntent = IntentType.PHISHING;
        } else if (message.includes('love') || message.includes('romance')) {
          detectedIntent = IntentType.ROMANCE_SCAM;
        } else if (message.includes('invest') || message.includes('profit')) {
          detectedIntent = IntentType.INVESTMENT_SCAM;
        } else if (message.includes('lottery') || message.includes('winner')) {
          detectedIntent = IntentType.LOTTERY_SCAM;
        } else if (message.includes('money') || message.includes('payment')) {
          detectedIntent = IntentType.MONEY_REQUEST;
        } else {
          detectedIntent = IntentType.UNKNOWN;
        }
      } else {
        detectedIntent = IntentType.LEGITIMATE;
      }

      // Save to database
      const scamCheck = new ScamCheck();
      scamCheck.message = request.message;
      scamCheck.extractedUrls =
        extractedUrls.length > 0 ? JSON.stringify(extractedUrls) : null;
      scamCheck.status = status;
      scamCheck.detectedIntent = detectedIntent;
      scamCheck.riskScore = riskScore;
      scamCheck.confidence = analysis.confidence;
      scamCheck.reasons = JSON.stringify(analysis.reasons);
      scamCheck.detectedPatterns = JSON.stringify(analysis.detectedPatterns);
      scamCheck.urlScanResults = urlScanResults
        ? JSON.stringify(urlScanResults)
        : null;
      scamCheck.checkedBy = request.checkedBy || null;
      scamCheck.ipAddress = request.ipAddress || null;
      scamCheck.userAgent = request.userAgent || null;

      const savedCheck = await this.scamCheckRepository.save(scamCheck);

      this.logger.log(
        `Scam check completed: ${savedCheck.id} - Status: ${status}`,
      );

      return this.mapToResponse(savedCheck);
    } catch (error) {
      this.logger.error('Error during scam check:', error);
      throw error;
    }
  }

  async getCheckById(id: string): Promise<ScamCheckResponse | null> {
    const check = await this.scamCheckRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    return check ? this.mapToResponse(check) : null;
  }

  async getChecksByUser(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<ScamCheckResponse[]> {
    const checks = await this.scamCheckRepository.find({
      where: { checkedBy: userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['user'],
    });

    return checks.map((check) => this.mapToResponse(check));
  }

  async getRecentChecks(limit = 50): Promise<ScamCheckResponse[]> {
    const checks = await this.scamCheckRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user'],
    });

    return checks.map((check) => this.mapToResponse(check));
  }

  async getStats(days = 30): Promise<ScamCheckStats> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const checks = await this.scamCheckRepository.find({
      where: {
        createdAt: MoreThanOrEqual(startDate),
      },
      order: { createdAt: 'DESC' },
    });

    const stats: ScamCheckStats = {
      totalChecks: checks.length,
      safeChecks: 0,
      suspiciousChecks: 0,
      maliciousChecks: 0,
      unknownChecks: 0,
      topIntents: [],
      recentChecks: [],
    };

    // Count by status
    const statusCounts = {
      [CheckStatus.SAFE]: 0,
      [CheckStatus.SUSPICIOUS]: 0,
      [CheckStatus.MALICIOUS]: 0,
      [CheckStatus.UNKNOWN]: 0,
    };

    // Count by intent
    const intentCounts: { [key in IntentType]?: number } = {};

    checks.forEach((check) => {
      statusCounts[check.status]++;

      if (check.detectedIntent) {
        intentCounts[check.detectedIntent] =
          (intentCounts[check.detectedIntent] || 0) + 1;
      }
    });

    stats.safeChecks = statusCounts[CheckStatus.SAFE];
    stats.suspiciousChecks = statusCounts[CheckStatus.SUSPICIOUS];
    stats.maliciousChecks = statusCounts[CheckStatus.MALICIOUS];
    stats.unknownChecks = statusCounts[CheckStatus.UNKNOWN];

    // Top intents
    stats.topIntents = Object.entries(intentCounts)
      .map(([intent, count]) => ({ intent: intent as IntentType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Recent checks (last 10)
    stats.recentChecks = checks
      .slice(0, 10)
      .map((check) => this.mapToResponse(check));

    return stats;
  }

  async getAllChecks(
    limit = 100,
    offset = 0,
    status?: CheckStatus,
    intent?: IntentType,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<{
    data: ScamCheckResponse[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const queryBuilder = this.scamCheckRepository
      .createQueryBuilder('check')
      .leftJoinAndSelect('check.user', 'user');

    // Apply filters
    if (status) {
      queryBuilder.andWhere('check.status = :status', { status });
    }

    if (intent) {
      queryBuilder.andWhere('check.detectedIntent = :intent', { intent });
    }

    if (fromDate) {
      queryBuilder.andWhere('check.createdAt >= :fromDate', { fromDate });
    }

    if (toDate) {
      queryBuilder.andWhere('check.createdAt <= :toDate', { toDate });
    }

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination and ordering
    const checks = await queryBuilder
      .orderBy('check.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();

    return {
      data: checks.map((check) => this.mapToResponse(check)),
      total,
      limit,
      offset,
    };
  }

  async deleteCheck(id: string): Promise<boolean> {
    const result = await this.scamCheckRepository.delete(id);
    return (result.affected || 0) > 0;
  }

  private mapToResponse(check: ScamCheck): ScamCheckResponse {
    return {
      id: check.id,
      status: check.status,
      detectedIntent: check.detectedIntent,
      riskScore: check.riskScore,
      confidence: check.confidence,
      reasons: check.reasons ? JSON.parse(check.reasons) : [],
      detectedPatterns: check.detectedPatterns
        ? JSON.parse(check.detectedPatterns)
        : [],
      urlScanResults: check.urlScanResults
        ? JSON.parse(check.urlScanResults)
        : null,
      message: check.message,
      extractedUrls: check.extractedUrls ? JSON.parse(check.extractedUrls) : [],
      createdAt: check.createdAt,
    };
  }
}
