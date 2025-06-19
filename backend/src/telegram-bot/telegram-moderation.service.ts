import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegramConfig } from '../common/interfaces/config.interface';

export interface ModerationResult {
  isScam: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
  reasons: string[];
  detectedPatterns: string[];
}

@Injectable()
export class TelegramModerationService {
  private readonly logger = new Logger(TelegramModerationService.name);
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

  constructor(private configService: ConfigService) {
    const telegramConfig = this.configService.get<TelegramConfig>('telegram');
    if (!telegramConfig) {
      throw new Error('Telegram configuration is required');
    }
    this.config = telegramConfig;
  }

  async analyzeMessage(
    text: string,
    _userId?: string,
  ): Promise<ModerationResult> {
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
      confidence,
      reasons,
      detectedPatterns,
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
}
