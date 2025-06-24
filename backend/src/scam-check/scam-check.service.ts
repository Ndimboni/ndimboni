import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import {
  ScamCheck,
  CheckStatus,
  IntentType,
} from '../entities/scam-check.entity';
import { TelegramModerationService } from '../telegram-bot/telegram-moderation.service';
import {
  ScanSummary,
  UrlScanningService,
} from 'src/common/services/url-scanning.service';
import { GroqService } from '../common/services/groq.service';

export interface ScamCheckRequest {
  message: string;
  checkedBy?: string;
  ipAddress?: string;
  userAgent?: string;
  source?: string; // Source of the check (web, telegram, api, etc.)
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
  source: string;
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
    private readonly groqService: GroqService,
  ) {}

  async checkMessage(request: ScamCheckRequest): Promise<ScamCheckResponse> {
    const startTime = Date.now();

    try {
      this.logger.log(
        `Starting scam check: ${request.message.substring(0, 100)}...`,
      );

      // Extract URLs from the message with improved regex
      const extractedUrls = this.extractUrls(request.message);

      // Create a timeout promise for analysis
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error('Analysis timeout after 30 seconds')),
          30000,
        );
      });

      // Analyze the message using Telegram moderation service with timeout
      const analysis = await Promise.race([
        this.telegramModerationService.analyzeMessage(request.message),
        timeoutPromise,
      ]);

      // Scan URLs if any found
      let urlScanResults: ScanSummary | null = null;
      let riskScore = analysis.confidence;

      if (extractedUrls.length > 0) {
        this.logger.log(`Scanning ${extractedUrls.length} URLs...`);
        try {
          // URL scanning with timeout
          const scanSummary = await Promise.race([
            this.urlScanningService.scanUrls(extractedUrls),
            new Promise<ScanSummary>((_, reject) => {
              setTimeout(() => reject(new Error('URL scan timeout')), 15000);
            }),
          ]);
          urlScanResults = scanSummary;

          // Adjust risk score based on URL scan results
          if (scanSummary.maliciousUrls > 0) {
            riskScore = Math.max(riskScore, 0.9);
            analysis.reasons.push('malicious_urls_detected');
          } else if (scanSummary.suspiciousUrls > 0) {
            riskScore = Math.max(riskScore, 0.6);
            analysis.reasons.push('suspicious_urls_detected');
          }
        } catch (urlError) {
          this.logger.warn('URL scanning failed or timed out:', urlError);
          // Continue without URL results if scanning fails
          if (extractedUrls.length > 0) {
            analysis.reasons.push('contains_urls_scan_unavailable');
            riskScore = Math.max(riskScore, 0.3); // Slight risk increase for unscanned URLs
          }
        }
      }

      // Ensure risk score is properly normalized between 0 and 1
      riskScore = Math.min(Math.max(riskScore, 0), 1);

      // Determine final status based on risk score
      let status: CheckStatus;
      if (riskScore >= 0.8) {
        status = CheckStatus.MALICIOUS;
        analysis.isScam = true; // Mark as scam if malicious
      } else if (riskScore >= 0.5) {
        status = CheckStatus.SUSPICIOUS;
        analysis.isScam = true; // Mark as scam if suspicious
      } else if (riskScore > 0.1) {
        status = CheckStatus.SAFE;
      } else {
        status = CheckStatus.UNKNOWN;
      }

      // Determine intent using Groq AI analysis instead of simple if statements
      let detectedIntent = IntentType.UNKNOWN;
      let intentConfidence = 0;

      if (analysis.isScam) {
        try {
          const intentAnalysis = await Promise.race([
            this.groqService.analyzeIntent(request.message),
            new Promise<any>((_, reject) => {
              setTimeout(
                () => reject(new Error('Intent analysis timeout')),
                10000,
              );
            }),
          ]);
          detectedIntent = intentAnalysis.intent;
          intentConfidence = intentAnalysis.confidence;

          this.logger.log(
            `Groq intent analysis: ${detectedIntent} (confidence: ${intentConfidence}) - ${intentAnalysis.reasoning}`,
          );
        } catch (error) {
          this.logger.warn(
            'Intent analysis with Groq failed or timed out, falling back to basic detection:',
            error,
          );
          // Fallback to basic pattern matching if Groq fails
          detectedIntent = this.detectIntentBasic(request.message);
        }
      } else {
        detectedIntent = IntentType.LEGITIMATE;
        intentConfidence = analysis.confidence;
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
      scamCheck.source = request.source || 'web';

      const savedCheck = await this.scamCheckRepository.save(scamCheck);

      const processingTime = Date.now() - startTime;
      this.logger.log(
        `Scam check completed: ${savedCheck.id} - Status: ${status}, Risk: ${Math.round(riskScore * 100)}%, Time: ${processingTime}ms`,
      );

      return this.mapToResponse(savedCheck);
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(
        `Error during scam check (${processingTime}ms):`,
        error,
      );
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
      source: check.source,
      createdAt: check.createdAt,
    };
  }

  /**
   * Basic intent detection fallback method using simple pattern matching
   * Used when Groq API is unavailable or fails
   */
  private detectIntentBasic(message: string): IntentType {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes('phish') ||
      lowerMessage.includes('login') ||
      lowerMessage.includes('verify account')
    ) {
      return IntentType.PHISHING;
    } else if (
      lowerMessage.includes('love') ||
      lowerMessage.includes('romance') ||
      lowerMessage.includes('relationship')
    ) {
      return IntentType.ROMANCE_SCAM;
    } else if (
      lowerMessage.includes('invest') ||
      lowerMessage.includes('profit') ||
      lowerMessage.includes('returns')
    ) {
      return IntentType.INVESTMENT_SCAM;
    } else if (
      lowerMessage.includes('lottery') ||
      lowerMessage.includes('winner') ||
      lowerMessage.includes('prize')
    ) {
      return IntentType.LOTTERY_SCAM;
    } else if (
      lowerMessage.includes('money') ||
      lowerMessage.includes('payment') ||
      lowerMessage.includes('transfer')
    ) {
      return IntentType.MONEY_REQUEST;
    } else if (
      lowerMessage.includes('technical support') ||
      lowerMessage.includes('computer problem') ||
      lowerMessage.includes('virus')
    ) {
      return IntentType.TECH_SUPPORT_SCAM;
    } else {
      return IntentType.UNKNOWN;
    }
  }

  /**
   * Extract URLs from a message using comprehensive regex patterns
   * Handles various URL formats including with and without protocols
   */
  private extractUrls(message: string): string[] {
    const urls: string[] = [];

    // Pattern 1: URLs with http/https protocol
    const httpsRegex =
      /https?:\/\/(?:[-\w.])+(?::[0-9]+)?(?:\/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?/gi;

    // Pattern 2: www. domains without protocol
    const wwwRegex =
      /www\.(?:[-\w.])+(?::[0-9]+)?(?:\/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?/gi;

    // Pattern 3: Common domain extensions without www or protocol
    const domainRegex =
      /(?:^|\s)([a-zA-Z0-9-]+\.(?:com|org|net|edu|gov|mil|int|co|io|me|ly|be|it|de|uk|ca|au|in|cn|jp|fr|br|ru|pl|nl|se|no|dk|fi|ch|at|cz|sk|hu|ro|bg|hr|si|ee|lv|lt|ie|pt|es|gr|tr|il|eg|za|ng|ke|gh|tz|ug|zw|bw|mw|zm|ao|mz|mg|mu|sc|re|yt|tf|hm|cc|cx|nf|ac|sh|ta)\b)(?:\/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?/gi;

    // Extract URLs with protocols
    let matches = message.match(httpsRegex);
    if (matches) {
      urls.push(...matches);
    }

    // Extract www domains and add protocol
    matches = message.match(wwwRegex);
    if (matches) {
      urls.push(...matches.map((url) => `https://${url}`));
    }

    // Extract domain-only URLs and add protocol
    matches = message.match(domainRegex);
    if (matches) {
      urls.push(
        ...matches.map((url) => {
          const cleanUrl = url.trim();
          return cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
        }),
      );
    }

    // Remove duplicates and filter out invalid URLs
    const uniqueUrls = [...new Set(urls)];

    // Additional validation to ensure URLs are properly formatted
    return uniqueUrls.filter((url) => {
      try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
      } catch {
        return false;
      }
    });
  }
}
