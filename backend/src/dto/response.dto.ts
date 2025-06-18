import { ApiProperty } from '@nestjs/swagger';
import { CheckStatus, IntentType } from '../entities/scam-check.entity';
import { ScammerType, ScammerStatus } from '../entities/scammer-report.entity';

export class ScamCheckResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the check',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Status of the check result',
    enum: CheckStatus,
    example: CheckStatus.SUSPICIOUS,
  })
  status: CheckStatus;

  @ApiProperty({
    description: 'Detected intent type',
    enum: IntentType,
    example: IntentType.PHISHING,
  })
  detectedIntent: IntentType;

  @ApiProperty({
    description: 'Risk score from 0 to 1',
    example: 0.8,
    minimum: 0,
    maximum: 1,
  })
  riskScore: number;

  @ApiProperty({
    description: 'Confidence in the analysis',
    example: 0.9,
    minimum: 0,
    maximum: 1,
  })
  confidence: number;

  @ApiProperty({
    description: 'Reasons for the classification',
    example: ['suspicious_keywords', 'urgency_patterns'],
    type: [String],
  })
  reasons: string[];

  @ApiProperty({
    description: 'Detected scam patterns',
    example: ['money_request', 'urgent_action'],
    type: [String],
  })
  detectedPatterns: string[];

  @ApiProperty({
    description: 'URL scanning results',
    example: { totalUrls: 2, maliciousUrls: 1, safeUrls: 1 },
    required: false,
  })
  urlScanResults?: any;

  @ApiProperty({
    description: 'Original message that was checked',
    example: 'Click here to claim your prize!',
  })
  message: string;

  @ApiProperty({
    description: 'URLs extracted from the message',
    example: ['https://suspicious-site.com'],
    type: [String],
    required: false,
  })
  extractedUrls?: string[];

  @ApiProperty({
    description: 'When the check was created',
    example: '2025-06-18T10:30:00Z',
  })
  createdAt: Date;
}

export class ScammerReportResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the report',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Type of scammer',
    enum: ScammerType,
    example: ScammerType.EMAIL,
  })
  type: ScammerType;

  @ApiProperty({
    description: 'Scammer identifier',
    example: 'scammer@example.com',
  })
  identifier: string;

  @ApiProperty({
    description: 'Description of the scam',
    example: 'Attempted phishing attack',
  })
  description: string;

  @ApiProperty({
    description: 'Evidence provided',
    example: ['screenshot.jpg', 'email.pdf'],
    type: [String],
  })
  evidence: string[];

  @ApiProperty({
    description: 'Status of the report',
    enum: ScammerStatus,
    example: ScammerStatus.VERIFIED,
  })
  status: ScammerStatus;

  @ApiProperty({
    description: 'User who reported the scammer',
    example: 'user123',
    required: false,
  })
  reportedBy?: string;

  @ApiProperty({
    description: 'User who verified the report',
    example: 'admin456',
    required: false,
  })
  verifiedBy?: string;

  @ApiProperty({
    description: 'Additional information',
    example: 'Multiple reports received',
    required: false,
  })
  additionalInfo?: string;

  @ApiProperty({
    description: 'Number of reports for this scammer',
    example: 5,
  })
  reportCount: number;

  @ApiProperty({
    description: 'When the scammer was last reported',
    example: '2025-06-18T10:30:00Z',
    required: false,
  })
  lastReportedAt?: Date;

  @ApiProperty({
    description: 'When the report was created',
    example: '2025-06-18T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the report was last updated',
    example: '2025-06-18T10:30:00Z',
  })
  updatedAt: Date;
}

export class ScamCheckStatsDto {
  @ApiProperty({
    description: 'Total number of checks performed',
    example: 1500,
  })
  totalChecks: number;

  @ApiProperty({
    description: 'Number of safe checks',
    example: 800,
  })
  safeChecks: number;

  @ApiProperty({
    description: 'Number of suspicious checks',
    example: 400,
  })
  suspiciousChecks: number;

  @ApiProperty({
    description: 'Number of malicious checks',
    example: 200,
  })
  maliciousChecks: number;

  @ApiProperty({
    description: 'Number of unknown checks',
    example: 100,
  })
  unknownChecks: number;

  @ApiProperty({
    description: 'Top detected intents',
    example: [
      { intent: 'PHISHING', count: 150 },
      { intent: 'ROMANCE_SCAM', count: 80 },
    ],
  })
  topIntents: { intent: IntentType; count: number }[];

  @ApiProperty({
    description: 'Recent checks',
    type: [ScamCheckResponseDto],
  })
  recentChecks: ScamCheckResponseDto[];
}

export class ScammerReportStatsDto {
  @ApiProperty({
    description: 'Total number of reports',
    example: 500,
  })
  totalReports: number;

  @ApiProperty({
    description: 'Number of pending reports',
    example: 50,
  })
  pendingReports: number;

  @ApiProperty({
    description: 'Number of verified reports',
    example: 400,
  })
  verifiedReports: number;

  @ApiProperty({
    description: 'Number of false positive reports',
    example: 50,
  })
  falsePositiveReports: number;

  @ApiProperty({
    description: 'Reports by type',
    example: [
      { type: 'EMAIL', count: 300 },
      { type: 'PHONE', count: 200 },
    ],
  })
  reportsByType: { type: ScammerType; count: number }[];

  @ApiProperty({
    description: 'Top reported scammers',
    type: [ScammerReportResponseDto],
  })
  topScammers: ScammerReportResponseDto[];
}

// Standard API Response wrappers
export class ApiSuccessResponse<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  data: T;

  @ApiProperty({ example: 'Operation successful' })
  message: string;
}

export class ApiErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Error occurred' })
  message: string;

  @ApiProperty({ example: 400 })
  statusCode: number;
}
