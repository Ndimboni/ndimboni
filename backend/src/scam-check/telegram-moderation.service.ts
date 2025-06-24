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
  analysisMethod?: 'ai' | 'rule-based' | 'enhanced' | 'flowchart';
  finalAnalysis?: FinalAnalysis;
}

// Type alias for compatibility
export type ModerationResult = RankingServiceResult;

@Injectable()
export class RankingService {
  private readonly logger = new Logger(RankingService.name);
  private readonly config: TelegramConfig;

  private readonly urlPatterns = [
    /bit\.ly\/\w+/gi,
    /tinyurl\.com\/\w+/gi,
    /t\.co\/\w+/gi,
    /goo\.gl\/\w+/gi,
    /short\.link\/\w+/gi,
    /adf\.ly\/\w+/gi,
    /ow\.ly\/\w+/gi,
  ];

  private readonly phoneNumberPatterns = [
    /\+?\d{1,4}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,9}[\s-]?\d{1,9}/g,
    /whatsapp/gi,
    /telegram.*@\w+/gi,
    /contact.*\+?\d+/gi,
  ];

  private readonly scamKeywords = [
    // Financial scams
    'quick money',
    'easy money',
    'guaranteed profit',
    'double your money',
    'investment opportunity',
    'make money fast',
    'passive income',
    'bitcoin investment',
    'forex trading',
    'pyramid scheme',

    // Romance/dating scams
    'lonely',
    'widow',
    'widower',
    'military',
    'overseas',
    'inheritance',
    'business trip',
    'hospital',

    // Tech support scams
    'virus detected',
    'computer infected',
    'microsoft support',
    'apple support',
    'refund',
    'suspended account',

    // General scam indicators
    'urgent',
    'act now',
    'limited time',
    'congratulations',
    'winner',
    'lottery',
    'prize',
    'gift card',
    'verification required',
    'click here',
    'download now',
  ];

  private readonly urgencyPatterns = [
    /urgent/gi,
    /asap/gi,
    /immediately/gi,
    /act now/gi,
    /limited time/gi,
    /expires (today|soon|tonight)/gi,
    /hurry/gi,
    /don't wait/gi,
  ];

  private readonly impersonationPatterns = [
    /official.*support/gi,
    /customer.*service/gi,
    /security.*team/gi,
    /account.*verification/gi,
    /administrator/gi,
    /moderator/gi,
  ];

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
      return this.analyzeMessageEnhanced(text, _userId);
    }
  }

  /**
   * Detect additional patterns to supplement AI analysis
   */
  private detectAdditionalPatterns(
    text: string,
    detectedPatterns: string[],
  ): void {
    // Check for URLs
    this.urlPatterns.forEach((pattern) => {
      if (pattern.test(text)) {
        detectedPatterns.push('suspicious_url');
      }
    });

    // Check for phone patterns
    this.phoneNumberPatterns.forEach((pattern) => {
      if (pattern.test(text)) {
        detectedPatterns.push('phone_harvesting');
      }
    });

    // Check for urgency patterns
    this.urgencyPatterns.forEach((pattern) => {
      if (pattern.test(text)) {
        detectedPatterns.push('urgency_tactics');
      }
    });
  }

  private async analyzeMessageRuleBased(
    text: string,
    _userId?: string,
  ): Promise<RankingServiceResult> {
    const reasons: string[] = [];
    const detectedPatterns: string[] = [];
    let totalScore = 0;
    let confidence = 0;

    // Check for scam keywords
    const keywordScore = this.checkScamKeywords(
      text,
      reasons,
      detectedPatterns,
    );
    totalScore += keywordScore;

    // Check for urgency patterns
    const urgencyScore = this.checkUrgencyPatterns(
      text,
      reasons,
      detectedPatterns,
    );
    totalScore += urgencyScore;

    // Check for suspicious URLs
    const urlScore = this.checkSuspiciousUrls(text, reasons, detectedPatterns);
    totalScore += urlScore;

    // Check for phone number harvesting
    const phoneScore = this.checkPhoneNumberHarvesting(
      text,
      reasons,
      detectedPatterns,
    );
    totalScore += phoneScore;

    // Check for impersonation attempts
    const impersonationScore = this.checkImpersonation(
      text,
      reasons,
      detectedPatterns,
    );
    totalScore += impersonationScore;

    // Check for grammar and spelling issues (common in scams)
    const grammarScore = this.checkGrammarIssues(
      text,
      reasons,
      detectedPatterns,
    );
    totalScore += grammarScore;

    // Calculate confidence and risk level
    confidence = Math.min(totalScore / 10, 1); // Normalize to 0-1

    // Ensure minimum confidence of 0.1 if any patterns were detected
    if (totalScore > 0 && confidence < 0.1) {
      confidence = 0.1;
    }

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (totalScore >= 7) {
      riskLevel = 'high';
    } else if (totalScore >= 4) {
      riskLevel = 'medium';
    }

    const isScam = totalScore >= 5; // Threshold for considering a message as scam

    this.logger.debug(
      `Message analysis: score=${totalScore}, confidence=${confidence}, risk=${riskLevel}, isScam=${isScam}`,
    );

    return {
      isScam,
      riskLevel,
      riskScore: totalScore / 10, // Normalize to 0-1 scale
      confidence,
      reasons,
      detectedPatterns,
      analysisMethod: 'rule-based',
    };
  }

  private checkScamKeywords(
    text: string,
    reasons: string[],
    detectedPatterns: string[],
  ): number {
    let score = 0;
    const lowerText = text.toLowerCase();

    for (const keyword of this.scamKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        score += 1;
        detectedPatterns.push(keyword);
        if (score === 1) {
          reasons.push('Contains scam-related keywords');
        }
      }
    }

    return Math.min(score, 3); // Cap at 3 points
  }

  private checkUrgencyPatterns(
    text: string,
    reasons: string[],
    detectedPatterns: string[],
  ): number {
    let score = 0;

    for (const pattern of this.urgencyPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        score += matches.length;
        detectedPatterns.push(...matches);
        if (score > 0 && !reasons.includes('Contains urgency language')) {
          reasons.push('Contains urgency language');
        }
      }
    }

    return Math.min(score, 2); // Cap at 2 points
  }

  private checkSuspiciousUrls(
    text: string,
    reasons: string[],
    detectedPatterns: string[],
  ): number {
    let score = 0;

    // Check for shortened URLs
    for (const pattern of this.urlPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        score += matches.length * 2; // Shortened URLs are more suspicious
        detectedPatterns.push(...matches);
        if (!reasons.includes('Contains suspicious URLs')) {
          reasons.push('Contains suspicious URLs');
        }
      }
    }

    // Check for suspicious domains
    const suspiciousDomains = [
      'bit.ly',
      'tinyurl.com',
      't.co',
      'goo.gl',
      'short.link',
      'click.me',
      'earn.com',
      'money.com',
    ];

    for (const domain of suspiciousDomains) {
      if (text.toLowerCase().includes(domain)) {
        score += 1;
        detectedPatterns.push(domain);
        if (!reasons.includes('Contains suspicious URLs')) {
          reasons.push('Contains suspicious URLs');
        }
      }
    }

    return Math.min(score, 3); // Cap at 3 points
  }

  private checkPhoneNumberHarvesting(
    text: string,
    reasons: string[],
    detectedPatterns: string[],
  ): number {
    let score = 0;

    for (const pattern of this.phoneNumberPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        score += matches.length;
        detectedPatterns.push(...matches);
        if (
          score > 0 &&
          !reasons.includes('Requests personal contact information')
        ) {
          reasons.push('Requests personal contact information');
        }
      }
    }

    return Math.min(score, 2); // Cap at 2 points
  }

  private checkImpersonation(
    text: string,
    reasons: string[],
    detectedPatterns: string[],
  ): number {
    let score = 0;

    for (const pattern of this.impersonationPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        score += matches.length * 2; // Impersonation is highly suspicious
        detectedPatterns.push(...matches);
        if (score > 0 && !reasons.includes('Potential impersonation attempt')) {
          reasons.push('Potential impersonation attempt');
        }
      }
    }

    return Math.min(score, 4); // Cap at 4 points
  }

  private checkGrammarIssues(
    text: string,
    reasons: string[],
    detectedPatterns: string[],
  ): number {
    let score = 0;

    // Check for excessive punctuation
    const excessivePunctuation = /[!]{2,}|[?]{2,}|[.]{3,}/g;
    const punctuationMatches = text.match(excessivePunctuation);
    if (punctuationMatches && punctuationMatches.length > 2) {
      score += 1;
      detectedPatterns.push('excessive punctuation');
      reasons.push('Poor grammar/formatting (common in scams)');
    }

    // Check for all caps (common in scam messages)
    const allCapsWords = text.match(/\b[A-Z]{4,}\b/g);
    if (allCapsWords && allCapsWords.length > 3) {
      score += 1;
      detectedPatterns.push('excessive caps');
      if (!reasons.includes('Poor grammar/formatting (common in scams)')) {
        reasons.push('Poor grammar/formatting (common in scams)');
      }
    }

    // Check for repeated characters
    const repeatedChars = /(.)\1{3,}/g;
    const repeatedMatches = text.match(repeatedChars);
    if (repeatedMatches && repeatedMatches.length > 1) {
      score += 1;
      detectedPatterns.push('repeated characters');
      if (!reasons.includes('Poor grammar/formatting (common in scams)')) {
        reasons.push('Poor grammar/formatting (common in scams)');
      }
    }

    return Math.min(score, 2); // Cap at 2 points
  }

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
  async analyzeMessageEnhanced(
    text: string,
    userId?: string,
  ): Promise<ModerationResult> {
    this.logger.log('Starting enhanced message analysis...');

    const results: {
      groq?: any;
      ruleBased: ModerationResult;
    } = {
      ruleBased: await this.analyzeMessageRuleBased(text, userId),
    };

    try {
      this.logger.log('Requesting Groq AI analysis...');
      // Get Groq analysis
      const groqAnalysis = await this.groqService.analyzeIntent(text);
      results.groq = groqAnalysis;

      this.logger.log(
        `Groq analysis completed: confidence=${groqAnalysis.confidence}, isScam=${groqAnalysis.isScam}`,
      );

      // Combine insights from both systems
      const combinedReasons = [...results.ruleBased.reasons];
      const combinedPatterns = [...results.ruleBased.detectedPatterns];

      // Add Groq reasoning if different
      if (!combinedReasons.includes(groqAnalysis.reasoning)) {
        combinedReasons.unshift(`AI Analysis: ${groqAnalysis.reasoning}`);
      }

      // Determine final verdict by combining both analyses
      const ruleBasedIsScam = results.ruleBased.isScam;
      const groqIsScam = groqAnalysis.isScam;

      // If either system detects a scam, consider it suspicious
      const finalIsScam = ruleBasedIsScam || groqIsScam;

      // Use the higher confidence score, but ensure it's properly normalized
      let finalConfidence = Math.max(
        results.ruleBased.confidence,
        groqAnalysis.confidence,
      );

      // Ensure confidence is between 0 and 1
      finalConfidence = Math.min(Math.max(finalConfidence, 0), 1);

      // Adjust risk level based on combined analysis
      let finalRiskLevel: 'low' | 'medium' | 'high' = 'low';
      if (finalIsScam && finalConfidence >= 0.8) {
        finalRiskLevel = 'high';
      } else if (finalIsScam && finalConfidence >= 0.5) {
        finalRiskLevel = 'medium';
      } else if (
        results.ruleBased.riskLevel === 'medium' ||
        groqAnalysis.confidence >= 0.4
      ) {
        finalRiskLevel = 'medium';
      }

      this.logger.log(
        `Enhanced analysis complete - Final: isScam=${finalIsScam}, confidence=${finalConfidence}, risk=${finalRiskLevel}`,
      );

      return {
        isScam: finalIsScam,
        riskLevel: finalRiskLevel,
        riskScore: finalConfidence,
        confidence: finalConfidence,
        reasons: combinedReasons,
        detectedPatterns: combinedPatterns,
        analysisMethod: 'enhanced',
      };
    } catch (error) {
      this.logger.warn(
        'Enhanced analysis failed, using rule-based results:',
        error,
      );

      // Ensure rule-based confidence is properly normalized
      const normalizedConfidence = Math.min(
        Math.max(results.ruleBased.confidence, 0),
        1,
      );

      return {
        ...results.ruleBased,
        confidence: normalizedConfidence,
      };
    }
  }

  /**
   * Main flowchart-based analysis method implementing the complete scam detection logic
   * according to the provided flowchart: Extract identifiers -> Check database ->
   * Intent analysis -> URL scanning -> Combine scores -> Provide recommendations
   */
  async analyzeMessageFlowchart(
    text: string,
    userId?: string,
  ): Promise<RankingServiceResult> {
    this.logger.log('Starting flowchart-based message analysis...');

    try {
      // Step 1: Extract identifiers (phone numbers, emails, links)
      const extractedIdentifiers = this.extractIdentifiers(text);
      this.logger.log(`Extracted identifiers:`, extractedIdentifiers);

      // Step 2: Check phone numbers & emails against our database (Own DB Score)
      const ownDbScore = await this.checkOwnDatabase(extractedIdentifiers);
      this.logger.log(`Own DB Score: ${ownDbScore.score}`);

      // Step 3: Intent Analysis (analyze keywords, intent score)
      const intentScore = await this.analyzeIntent(text);
      this.logger.log(`Intent Score: ${intentScore.score}`);

      // Step 4: Check URLs against external APIs (External DB Score)
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

      // Step 5: Combine Own DB Score + External DB Score to form Final Database Score (60%)
      const finalDbScore = (ownDbScore.score + externalDbScore.score) / 2;

      // Step 6: Final Score = (Database Score * 60%) + (Intent Score * 40%)
      const finalScore = finalDbScore * 0.6 + intentScore.score * 0.4;

      // Step 7: Generate recommendations based on links presence and final score
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
        analysisMethod: 'flowchart',
        finalAnalysis,
      };
    } catch (error) {
      this.logger.error('Flowchart analysis failed:', error);
      // Fallback to enhanced analysis
      return this.analyzeMessageEnhanced(text, userId);
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
}
