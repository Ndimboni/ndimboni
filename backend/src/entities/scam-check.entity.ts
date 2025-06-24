import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum CheckStatus {
  SAFE = 'safe',
  SUSPICIOUS = 'suspicious',
  MALICIOUS = 'malicious',
  UNKNOWN = 'unknown',
}

export enum IntentType {
  PHISHING = 'phishing',
  ROMANCE_SCAM = 'romance_scam',
  INVESTMENT_SCAM = 'investment_scam',
  TECH_SUPPORT_SCAM = 'tech_support_scam',
  LOTTERY_SCAM = 'lottery_scam',
  MONEY_REQUEST = 'money_request',
  INFORMATION_HARVESTING = 'information_harvesting',
  MALWARE_DISTRIBUTION = 'malware_distribution',
  LEGITIMATE = 'legitimate',
  UNKNOWN = 'unknown',
}

@Entity('scam_checks')
export class ScamCheck {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  message: string;

  @Column('text', { nullable: true })
  extractedUrls: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    default: CheckStatus.UNKNOWN,
  })
  status: CheckStatus;

  @Column({
    type: 'varchar',
    length: 50,
    default: IntentType.UNKNOWN,
  })
  detectedIntent: IntentType;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  riskScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  confidence: number;

  @Column('text', { nullable: true })
  reasons: string | null; // JSON string of detected reasons

  @Column('text', { nullable: true })
  detectedPatterns: string | null; // JSON string of detected patterns

  @Column('text', { nullable: true })
  urlScanResults: string | null; // JSON string of URL scan results

  @Column({ nullable: true })
  checkedBy: string | null; // User ID who performed the check

  @Column('varchar', { length: 45, nullable: true })
  ipAddress: string | null; // IPv4 or IPv6 address

  @Column('text', { nullable: true })
  userAgent: string | null;

  @Column('varchar', { length: 50, default: 'web' })
  source: string; // Source of the check (web, telegram, api, etc.)

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'checkedBy' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
