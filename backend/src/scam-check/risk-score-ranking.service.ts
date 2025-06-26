import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegramConfig } from '../common/interfaces/config.interface';
import { GroqService } from '../common/services/groq.service';
import { ScammerReportService } from '../scammer-reports/scammer-report.service';
import { UrlScanningService } from '../common/services/url-scanning.service';
import { ScammerType } from '../entities/scammer-report.entity';

export interface ExtractedIdentifiers {
  phoneNumbers: string[];
  emails: string[];
  urls: string[];
}

export interface DatabaseScore {
  ownDbScore: number; // 0-1 score from our scammer database
  externalDbScore: number; // 0-1 score from external URL scanning
  finalDbScore: number; // Combined database score
  reasons: string[];
}

export interface IntentScore {
  score: number; // 0-1 score from intent analysis
  intent: string;
  confidence: number;
  reasons: string[];
}

export interface FinalAnalysis {
  finalScore: number; // Final combined score (0-1)
  databaseScore: DatabaseScore;
  intentScore: IntentScore;
  hasLinks: boolean;
  recommendations: string[];
  extractedIdentifiers: ExtractedIdentifiers;
}

export interface RankingServiceResult {
  isScam: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  confidence: number;
  reasons: string[];
  detectedPatterns: string[];
  analysisMethod?: 'ai' | 'rule-based' | 'enhanced' | 'AI and database';
  aiAnalysis: FinalAnalysis;
}

// Type alias for compatibility
export type ModerationResult = RankingServiceResult;

@Injectable()
export class RankingService {
  private readonly logger = new Logger(RankingService.name);
  private readonly config: TelegramConfig;

  constructor(
    private configService: ConfigService,
    private readonly groqService: GroqService,
    private readonly scammerReportService: ScammerReportService,
    private readonly urlScanningService: UrlScanningService,
  ) {
    const telegramConfig = this.configService.get<TelegramConfig>('telegram');
    if (!telegramConfig) {
      throw new Error('Telegram configuration is required');
    }
    this.config = telegramConfig;
  }

  async analyzeMessage(
    text: string,
    _userId?: string,
  ): Promise<RankingServiceResult> {
    try {
      // Use the new flowchart-based analysis method as primary
      return await this.analyzeMessageFlowchart(text, _userId);
    } catch (error) {
      this.logger.warn(
        'Flowchart analysis failed, falling back to enhanced analysis:',
        error,
      );
      // Fallback to enhanced analysis
      return this.analyzeMessageFlowchart(text, _userId);
    }
  }

  /**
   * Detect additional patterns to supplement AI analysis
   */

  async checkUrl(url: string): Promise<{ isSafe: boolean; reason?: string }> {
    try {
      // Basic URL validation
      new URL(url);

      // Check against known malicious patterns
      const suspiciousPatterns = [
        /bit\.ly/i,
        /tinyurl\.com/i,
        /t\.co/i,
        /goo\.gl/i,
        /click\.me/i,
        /earn\.com/i,
        /money\.com/i,
        /free\.money/i,
        /get\.rich/i,
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(url)) {
          return {
            isSafe: false,
            reason: 'URL matches known suspicious patterns',
          };
        }
      }

      // Check for suspicious parameters
      if (
        url.includes('ref=') ||
        url.includes('affiliate=') ||
        url.includes('promo=')
      ) {
        return {
          isSafe: false,
          reason: 'URL contains affiliate/promotional parameters',
        };
      }

      return { isSafe: true };
    } catch (_error) {
      return {
        isSafe: false,
        reason: 'Invalid URL format',
      };
    }
  }

  shouldModerate(chatType: string): boolean {
    return ['group', 'supergroup'].includes(chatType);
  }

  getModerationAction(result: ModerationResult): 'delete' | 'warn' | 'none' {
    if (
      result.isScam &&
      result.riskLevel === 'high' &&
      result.confidence > 0.7
    ) {
      return 'delete';
    } else if (result.riskLevel === 'medium' && result.confidence > 0.5) {
      return 'warn';
    }
    return 'none';
  }

  /**
   * Enhanced analysis that combines Groq AI with rule-based detection
   * for more comprehensive scam detection
   */

  /**
   * Main flowchart-based analysis method implementing the complete scam detection logic
   * according to the provided flowchart: Extract identifiers -> Check database ->
   * Intent analysis -> URL scanning -> Combine scores -> Provide recommendations
   */
  async analyzeMessageFlowchart(
    text: string,
    _userId?: string,
  ): Promise<RankingServiceResult> {
    this.logger.log('Starting flowchart-based message analysis...');

    try {
      const extractedIdentifiers = this.extractIdentifiers(text);
      this.logger.log(`Extracted identifiers:`, extractedIdentifiers);

      const ownDbScore = await this.checkOwnDatabase(extractedIdentifiers);
      this.logger.log(`Own DB Score: ${ownDbScore.score}`);

      const intentScore = await this.analyzeIntent(text);
      this.logger.log(`Intent Score: ${intentScore.score}`);

      let externalDbScore: { score: number; reasons: string[] } = {
        score: 0,
        reasons: [],
      };
      if (extractedIdentifiers.urls.length > 0) {
        externalDbScore = await this.checkExternalDatabase(
          extractedIdentifiers.urls,
        );
        this.logger.log(`External DB Score: ${externalDbScore.score}`);
      }
      console.log(
        `External DB Score: ${externalDbScore.score}`,
        externalDbScore.reasons,
        extractedIdentifiers.urls,
        extractedIdentifiers.phoneNumbers,
        extractedIdentifiers.emails,
        `Intent Score: ${intentScore.score}`,
        intentScore.reasons,
        `Own DB Score: ${ownDbScore.score}`,
        ownDbScore.reasons,
      );

      const finalDbScore = (ownDbScore.score + externalDbScore.score) / 2;

      const finalScore = finalDbScore * 0.6 + intentScore.score * 0.4;

      const recommendations = this.generateRecommendations(
        finalScore,
        extractedIdentifiers.urls.length > 0,
        {
          ownDbScore,
          externalDbScore,
          intentScore,
          extractedIdentifiers,
        },
      );

      // Determine risk level and other properties
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (finalScore >= 0.8) {
        riskLevel = 'high';
      } else if (finalScore >= 0.5) {
        riskLevel = 'medium';
      }

      const isScam = finalScore >= 0.6;

      const finalAnalysis: FinalAnalysis = {
        finalScore,
        databaseScore: {
          ownDbScore: ownDbScore.score,
          externalDbScore: externalDbScore.score,
          finalDbScore,
          reasons: [...ownDbScore.reasons, ...externalDbScore.reasons],
        },
        intentScore,
        hasLinks: extractedIdentifiers.urls.length > 0,
        recommendations,
        extractedIdentifiers,
      };

      // Combine all reasons
      const allReasons = [
        ...ownDbScore.reasons,
        ...externalDbScore.reasons,
        ...intentScore.reasons,
      ];

      this.logger.log(
        `Flowchart analysis complete - Final Score: ${finalScore}, Risk: ${riskLevel}, IsScam: ${isScam}`,
      );

      return {
        isScam,
        riskLevel,
        riskScore: finalScore,
        confidence: Math.min(finalScore + 0.1, 1), // Slightly higher confidence for comprehensive analysis
        reasons: allReasons,
        detectedPatterns: [], // Can be filled from intent analysis if needed
        analysisMethod: 'AI and database',
        aiAnalysis: finalAnalysis,
      };
    } catch (error) {
      this.logger.error('Flowchart analysis failed:', error);
      // Fallback to a basic safe result
      return {
        isScam: false,
        riskLevel: 'low',
        riskScore: 0,
        confidence: 0,
        reasons: ['Analysis failed - unable to determine risk'],
        detectedPatterns: [],
        analysisMethod: 'AI and database',
        aiAnalysis: {
          finalScore: 0,
          databaseScore: {
            ownDbScore: 0,
            externalDbScore: 0,
            finalDbScore: 0,
            reasons: [],
          },
          intentScore: {
            score: 0,
            intent: 'UNKNOWN',
            confidence: 0,
            reasons: [],
          },
          hasLinks: false,
          recommendations: [
            'Unable to analyze message - please verify manually',
          ],
          extractedIdentifiers: {
            phoneNumbers: [],
            emails: [],
            urls: [],
          },
        },
      };
    }
  }

  /**
   * Extract phone numbers, emails, and URLs from the message
   */
  private extractIdentifiers(text: string): ExtractedIdentifiers {
    const phoneNumbers: string[] = [];
    const emails: string[] = [];
    const urls: string[] = [];

    // Extract phone numbers
    const phonePatterns = [
      /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, // Standard phone patterns
      /(\+250|0)\d{9}/g, // Rwanda specific
      /whatsapp[\s:]+(\+?\d+)/gi,
      /telegram[\s:]+(@?\w+|\+?\d+)/gi,
      /contact[\s:]+(\+?\d+)/gi,
    ];

    phonePatterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        phoneNumbers.push(...matches.map((match) => match.trim()));
      }
    });

    // Extract emails
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emailMatches = text.match(emailPattern);
    if (emailMatches) {
      emails.push(...emailMatches);
    }

    // Extract URLs
    const urlPatterns = [
      /https?:\/\/[^\s<>"']+/gi,
      /www\.[^\s<>"']+/gi,
      /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}\.(?:com|org|net|edu|gov|mil|int|co|io|me|ly|be|it|de|uk|ca|au|in|cn|jp|fr|br|ru|pl|nl|se|no|dk|fi|ch|at|cz|sk|hu|ro|bg|hr|si|ee|lv|lt|ie|pt|es|gr|tr|il|eg|za|ng|ke|gh|tz|ug|zw|bw|mw|zm|ao|mz|mg|mu|sc|re|yt|tf|hm|cc|cx|nf|ac|sh|ta)\b[^\s<>"']*/gi,
    ];

    urlPatterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach((url) => {
          const cleanUrl = url.trim();
          const normalizedUrl = cleanUrl.startsWith('http')
            ? cleanUrl
            : `https://${cleanUrl}`;
          urls.push(normalizedUrl);
        });
      }
    });

    // Remove duplicates
    return {
      phoneNumbers: [...new Set(phoneNumbers)],
      emails: [...new Set(emails)],
      urls: [...new Set(urls)],
    };
  }

  /**
   * Check extracted identifiers against our scammer database
   */
  private async checkOwnDatabase(
    identifiers: ExtractedIdentifiers,
  ): Promise<{ score: number; reasons: string[] }> {
    let score = 0;
    const reasons: string[] = [];
    let totalChecks = 0;

    // Check phone numbers
    for (const phone of identifiers.phoneNumbers) {
      totalChecks++;
      try {
        const result = await this.scammerReportService.checkScammer(
          ScammerType.PHONE,
          phone,
        );
        if (result) {
          score += 1;
          reasons.push(`Phone number ${phone} found in scammer database`);
        }
      } catch (error) {
        this.logger.warn(`Error checking phone ${phone}:`, error);
      }
    }

    // Check emails
    for (const email of identifiers.emails) {
      totalChecks++;
      try {
        const result = await this.scammerReportService.checkScammer(
          ScammerType.EMAIL,
          email,
        );
        if (result) {
          score += 1;
          reasons.push(`Email ${email} found in scammer database`);
        }
      } catch (error) {
        this.logger.warn(`Error checking email ${email}:`, error);
      }
    }

    // Normalize score to 0-1 range
    const normalizedScore = totalChecks > 0 ? score / totalChecks : 0;

    return {
      score: normalizedScore,
      reasons,
    };
  }

  /**
   * Analyze message intent using keywords and patterns
   */
  private async analyzeIntent(text: string): Promise<IntentScore> {
    const reasons: string[] = [];
    let score = 0;

    // Try AI analysis first
    try {
      const groqAnalysis = await this.groqService.analyzeIntent(text);
      if (groqAnalysis.confidence > 0.4) {
        return {
          score: groqAnalysis.isScam ? 0.8 : 0.2,
          intent: groqAnalysis.intent,
          confidence: groqAnalysis.confidence,
          reasons: [groqAnalysis.reasoning],
        };
      }
    } catch (error) {
      this.logger.warn('AI intent analysis failed, using rule-based:', error);
    }

    // Fallback to rule-based analysis
    const lowerText = text.toLowerCase();

    // Money/financial keywords (high risk)
    const moneyKeywords = [
      'money',
      'cash',
      'payment',
      'transfer',
      'bitcoin',
      'investment',
      'profit',
      'earning',
    ];
    const moneyScore = moneyKeywords.filter((keyword) =>
      lowerText.includes(keyword),
    ).length;
    if (moneyScore > 0) {
      score += moneyScore * 0.3;
      reasons.push('Contains money/financial keywords');
    }

    // Gift/prize keywords (high risk)
    const giftKeywords = [
      'gift',
      'prize',
      'winner',
      'congratulations',
      'lottery',
      'reward',
    ];
    const giftScore = giftKeywords.filter((keyword) =>
      lowerText.includes(keyword),
    ).length;
    if (giftScore > 0) {
      score += giftScore * 0.3;
      reasons.push('Contains gift/prize keywords');
    }

    // Urgency keywords (medium risk)
    const urgencyKeywords = [
      'urgent',
      'immediately',
      'asap',
      'hurry',
      'limited time',
      'expires',
      'act now',
    ];
    const urgencyScore = urgencyKeywords.filter((keyword) =>
      lowerText.includes(keyword),
    ).length;
    if (urgencyScore > 0) {
      score += urgencyScore * 0.2;
      reasons.push('Contains urgency keywords');
    }

    // Personal info requests (medium risk)
    const infoKeywords = [
      'password',
      'pin',
      'account',
      'verify',
      'confirm',
      'personal information',
    ];
    const infoScore = infoKeywords.filter((keyword) =>
      lowerText.includes(keyword),
    ).length;
    if (infoScore > 0) {
      score += infoScore * 0.2;
      reasons.push('Requests personal information');
    }

    // Normalize score to 0-1 range
    const normalizedScore = Math.min(score, 1);

    return {
      score: normalizedScore,
      intent: normalizedScore > 0.5 ? 'SUSPICIOUS' : 'LEGITIMATE',
      confidence: normalizedScore,
      reasons,
    };
  }

  /**
   * Check URLs against external databases (VirusTotal, Google Safe Browsing)
   */
  private async checkExternalDatabase(
    urls: string[],
  ): Promise<{ score: number; reasons: string[] }> {
    if (urls.length === 0) {
      return { score: 0, reasons: [] };
    }

    try {
      const scanSummary = await this.urlScanningService.scanUrls(urls);
      const reasons: string[] = [];
      let score = 0;

      if (scanSummary.maliciousUrls > 0) {
        score = 1.0;
        reasons.push(`${scanSummary.maliciousUrls} malicious URLs detected`);
      } else if (scanSummary.suspiciousUrls > 0) {
        score = 0.6;
        reasons.push(`${scanSummary.suspiciousUrls} suspicious URLs detected`);
      } else if (scanSummary.safeUrls === scanSummary.totalUrls) {
        score = 0;
        reasons.push('All URLs appear safe');
      } else {
        score = 0.3;
        reasons.push('Some URLs could not be verified');
      }

      return { score, reasons };
    } catch (error) {
      this.logger.warn('URL scanning failed:', error);
      return {
        score: 0.3, // Slight risk increase for unscanned URLs
        reasons: ['URL scanning unavailable - could not verify links'],
      };
    }
  }

  /**
   * Generate recommendations based on final score and link presence
   */
  private generateRecommendations(
    finalScore: number,
    hasLinks: boolean,
    analysisData: any,
  ): string[] {
    const recommendations: string[] = [];

    if (hasLinks) {
      // Link-related recommendations
      if (finalScore >= 0.8) {
        recommendations.push(
          '🚨 HIGH RISK: Do not click any links in this message',
        );
        recommendations.push(
          '🚨 This appears to be a malicious scam - report immediately',
        );
        recommendations.push('🚨 Do not provide any personal information');
      } else if (finalScore >= 0.5) {
        recommendations.push('⚠️ CAUTION: Verify links before clicking');
        recommendations.push(
          '⚠️ Be cautious about providing personal information',
        );
        recommendations.push(
          '⚠️ Consider verifying sender through alternative means',
        );
      } else {
        recommendations.push(
          'ℹ️ Links detected - always verify before clicking',
        );
        recommendations.push('ℹ️ Ensure you trust the sender');
      }
    } else {
      // General recommendations
      if (finalScore >= 0.8) {
        recommendations.push('🚨 HIGH RISK: This appears to be a scam message');
        recommendations.push('🚨 Do not respond or provide any information');
        recommendations.push('🚨 Block the sender and report as spam');
      } else if (finalScore >= 0.5) {
        recommendations.push(
          '⚠️ SUSPICIOUS: Exercise caution with this message',
        );
        recommendations.push(
          '⚠️ Verify sender identity through alternative means',
        );
        recommendations.push(
          '⚠️ Be wary of any requests for money or information',
        );
      } else {
        recommendations.push('ℹ️ Message appears legitimate');
        recommendations.push('ℹ️ Always remain vigilant for potential scams');
      }
    }

    // Add specific recommendations based on analysis
    if (analysisData.ownDbScore.score > 0) {
      recommendations.push('📋 Sender information found in scammer database');
    }

    if (analysisData.intentScore.score > 0.5) {
      recommendations.push('🎯 Message content matches scam patterns');
    }

    return recommendations;
  }

  /**
   * Extract identifiers from text and save them as scammer reports
   * This method is used by bot services to automatically populate scammer database
   */
  async extractAndSaveScammerIdentifiers(
    text: string,
    reportId: string,
    source: 'telegram' | 'whatsapp' | 'web',
    reportedBy?: string,
  ): Promise<{
    extractedCount: number;
    savedReports: Array<{
      type: string;
      identifier: string;
      reportId: string;
    }>;
  }> {
    this.logger.log(
      `Extracting and saving scammer identifiers from ${source} report: ${reportId}`,
    );

    const extractedIdentifiers = this.extractIdentifiers(text);
    const savedReports: Array<{
      type: string;
      identifier: string;
      reportId: string;
    }> = [];
    let extractedCount = 0;

    // Helper function to check if a string is a valid UUID
    const isValidUUID = (str: string): boolean => {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(str);
    };

    // Only use reportedBy if it's a valid UUID (actual user ID from users table)
    // For bot users (Telegram/WhatsApp), we don't have user records, so pass undefined
    const validReportedBy =
      reportedBy && isValidUUID(reportedBy) ? reportedBy : undefined;

    // Include bot user identifier in additionalInfo instead
    const botUserInfo =
      reportedBy && !isValidUUID(reportedBy)
        ? `\nBot User ID: ${reportedBy}`
        : '';

    // Save phone numbers as scammer reports
    for (const phone of extractedIdentifiers.phoneNumbers) {
      try {
        const scammerReport = await this.scammerReportService.createReport({
          type: 'phone' as any, // ScammerType.PHONE
          identifier: phone,
          description: `Phone number extracted from scam report (${reportId})`,
          additionalInfo: `Original message: "${text.substring(0, 200)}${
            text.length > 200 ? '...' : ''
          }"${botUserInfo}`,
          reportedBy: validReportedBy,
          source,
        });

        savedReports.push({
          type: 'phone',
          identifier: phone,
          reportId: scammerReport.id,
        });
        extractedCount++;

        this.logger.log(
          `Saved phone number ${phone} as scammer report: ${scammerReport.id}`,
        );
      } catch (error) {
        this.logger.warn(`Failed to save phone number ${phone}:`, error);
      }
    }

    // Save emails as scammer reports
    for (const email of extractedIdentifiers.emails) {
      try {
        const scammerReport = await this.scammerReportService.createReport({
          type: 'email' as any, // ScammerType.EMAIL
          identifier: email,
          description: `Email address extracted from scam report (${reportId})`,
          additionalInfo: `Original message: "${text.substring(0, 200)}${
            text.length > 200 ? '...' : ''
          }"${botUserInfo}`,
          reportedBy: validReportedBy,
          source,
        });

        savedReports.push({
          type: 'email',
          identifier: email,
          reportId: scammerReport.id,
        });
        extractedCount++;

        this.logger.log(
          `Saved email ${email} as scammer report: ${scammerReport.id}`,
        );
      } catch (error) {
        this.logger.warn(`Failed to save email ${email}:`, error);
      }
    }

    // Save URLs as website scammer reports
    for (const url of extractedIdentifiers.urls) {
      try {
        // Extract domain from URL for cleaner identifier
        let domain = url;
        try {
          const urlObj = new URL(url);
          domain = urlObj.hostname;
        } catch (_urlError) {
          // If URL parsing fails, use the original URL
          this.logger.debug(`Could not parse URL ${url}, using as-is`);
        }

        const scammerReport = await this.scammerReportService.createReport({
          type: 'website' as any, // ScammerType.WEBSITE
          identifier: domain,
          description: `Website/URL extracted from scam report (${reportId})`,
          additionalInfo: `Full URL: ${url}\nOriginal message: "${text.substring(
            0,
            200,
          )}${text.length > 200 ? '...' : ''}"${botUserInfo}`,
          reportedBy: validReportedBy,
          source,
        });

        savedReports.push({
          type: 'website',
          identifier: domain,
          reportId: scammerReport.id,
        });
        extractedCount++;

        this.logger.log(
          `Saved website ${domain} as scammer report: ${scammerReport.id}`,
        );
      } catch (error) {
        this.logger.warn(`Failed to save URL ${url}:`, error);
      }
    }

    this.logger.log(
      `Extraction complete for report ${reportId}: ${extractedCount} identifiers saved from ${source}`,
    );

    return {
      extractedCount,
      savedReports,
    };
  }
}
