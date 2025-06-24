import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { IntentType } from '../../entities/scam-check.entity';

export interface IntentAnalysisResult {
  intent: IntentType;
  confidence: number;
  reasoning: string;
  isScam: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

@Injectable()
export class GroqService {
  private readonly logger = new Logger(GroqService.name);
  private readonly groq: Groq | null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');

    if (!apiKey) {
      this.logger.warn(
        'GROQ_API_KEY not found. Intent detection will use fallback logic.',
      );
      this.groq = null;
    } else {
      this.groq = new Groq({
        apiKey: apiKey,
      });
      this.logger.log('Groq service initialized successfully');
    }
  }

  async analyzeIntent(message: string): Promise<IntentAnalysisResult> {
    if (!this.groq) {
      return this.fallbackIntentDetection(message);
    }

    try {
      const prompt = this.buildIntentAnalysisPrompt(message);

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an expert AI system designed to analyze messages and detect potential scams in Rwanda and globally. 
            Your task is to classify the intent of messages and determine if they are legitimate or potentially harmful.
            
            Available intent types:
            - LEGITIMATE: Normal, safe communication
            - PHISHING: Attempts to steal credentials or personal information
            - ROMANCE_SCAM: Fake romantic relationships for financial gain
            - INVESTMENT_SCAM: Fraudulent investment opportunities
            - LOTTERY_SCAM: Fake lottery or prize notifications
            - MONEY_REQUEST: Direct requests for money transfers
            - TECH_SUPPORT_SCAM: Fake technical support requests
            - UNKNOWN: Cannot determine intent clearly
            
            Consider these factors:
            - Language patterns common in scams
            - Urgency and pressure tactics
            - Requests for personal information
            - Financial elements
            - Too-good-to-be-true offers
            - Grammar and spelling inconsistencies
            - Emotional manipulation
            - Context relevant to Rwanda and East Africa
            
            Respond with a JSON object containing:
            {
              "intent": "INTENT_TYPE",
              "confidence": 0.85,
              "reasoning": "Brief explanation of your analysis",
              "isScam": true/false,
              "riskLevel": "<low|medium|high>",
            }
            
            Confidence should be between 0.0 and 1.0.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama3-8b-8192', // Using Llama 3 8B model for fast and accurate results
        temperature: 0.1, // Low temperature for consistent, focused analysis
        max_tokens: 500,
        response_format: { type: 'json_object' },
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from Groq API');
      }

      const result = JSON.parse(response);

      // Validate the response structure
      if (!result.intent || typeof result.confidence !== 'number') {
        throw new Error('Invalid response format from Groq API');
      }

      // Ensure intent is a valid IntentType
      const validIntents = Object.values(IntentType);
      if (!validIntents.includes(result.intent)) {
        this.logger.warn(
          `Invalid intent type received: ${result.intent}, defaulting to UNKNOWN`,
        );
        result.intent = IntentType.UNKNOWN;
      }

      // Ensure confidence is within valid range
      result.confidence = Math.max(0, Math.min(1, result.confidence));

      this.logger.log(
        `Intent analysis completed: ${result.intent} (confidence: ${result.confidence})`,
      );

      return {
        intent: result.intent,
        confidence: result.confidence,
        reasoning: result.reasoning || 'No reasoning provided',
        isScam: result.isScam || false,
        riskLevel: result.riskLevel || 'unknown',
      };
    } catch (error) {
      this.logger.error('Error analyzing intent with Groq:', error);
      return this.fallbackIntentDetection(message);
    }
  }

  private buildIntentAnalysisPrompt(message: string): string {
    return `Analyze the following message and determine its intent, whether it's a scam, and provide reasoning for your analysis:

Message: "${message}"

Consider:
1. Is this message trying to deceive or manipulate the recipient?
2. Does it contain requests for money, personal information, or credentials?
3. Are there suspicious patterns, poor grammar, or urgency tactics?
4. Does it promise unrealistic benefits or threaten consequences?
5. Context: This analysis is for a Rwandan digital scam protection platform.

Provide your analysis in the specified JSON format.`;
  }

  private fallbackIntentDetection(message: string): IntentAnalysisResult {
    this.logger.log('Using fallback intent detection');

    const lowerMessage = message.toLowerCase();
    let intent = IntentType.LEGITIMATE;
    let confidence = 0.3; // Lower confidence for rule-based detection
    let reasoning = 'Analyzed using rule-based fallback system';
    let isScam = false;

    // Simple pattern matching for basic intent detection
    if (
      lowerMessage.includes('phish') ||
      lowerMessage.includes('login') ||
      lowerMessage.includes('verify account')
    ) {
      intent = IntentType.PHISHING;
      isScam = true;
      reasoning = 'Contains phishing-related keywords';
    } else if (
      lowerMessage.includes('love') ||
      lowerMessage.includes('romance') ||
      lowerMessage.includes('relationship')
    ) {
      intent = IntentType.ROMANCE_SCAM;
      isScam = true;
      reasoning = 'Contains romance-related keywords that may indicate scam';
    } else if (
      lowerMessage.includes('invest') ||
      lowerMessage.includes('profit') ||
      lowerMessage.includes('returns')
    ) {
      intent = IntentType.INVESTMENT_SCAM;
      isScam = true;
      reasoning =
        'Contains investment-related keywords with potential scam indicators';
    } else if (
      lowerMessage.includes('lottery') ||
      lowerMessage.includes('winner') ||
      lowerMessage.includes('prize')
    ) {
      intent = IntentType.LOTTERY_SCAM;
      isScam = true;
      reasoning = 'Contains lottery/prize-related keywords';
    } else if (
      lowerMessage.includes('money') ||
      lowerMessage.includes('payment') ||
      lowerMessage.includes('transfer')
    ) {
      intent = IntentType.MONEY_REQUEST;
      isScam = true;
      reasoning = 'Contains money/payment-related keywords';
    } else if (
      lowerMessage.includes('technical support') ||
      lowerMessage.includes('computer problem') ||
      lowerMessage.includes('virus')
    ) {
      intent = IntentType.TECH_SUPPORT_SCAM;
      isScam = true;
      reasoning = 'Contains tech support-related keywords';
    } else {
      intent = IntentType.UNKNOWN;
      reasoning = 'No clear patterns detected, classified as unknown';
    }

    return {
      intent,
      confidence,
      reasoning,
      isScam,
      riskLevel: 'low',
    };
  }

  async healthCheck(): Promise<boolean> {
    if (!this.groq) {
      return false;
    }

    try {
      await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: 'Health check' }],
        model: 'llama3-8b-8192',
        max_tokens: 10,
      });
      return true;
    } catch (error) {
      this.logger.error('Groq health check failed:', error);
      return false;
    }
  }
}
