import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ScammerReportInstance } from './scammer-report-instance.entity';

export enum ScammerType {
  EMAIL = 'email',
  PHONE = 'phone',
  SOCIAL_MEDIA = 'social_media',
  WEBSITE = 'website',
  OTHER = 'other',
}

export enum ScammerStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  FALSE_POSITIVE = 'false_positive',
  INVESTIGATING = 'investigating',
}

@Entity('scammer_reports')
export class ScammerReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  type: ScammerType;

  @Column('varchar', { length: 255 })
  identifier: string; // Email, phone number, username, etc.

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  evidence: string | null; // JSON string of evidence (URLs, screenshots, etc.)

  @Column({
    type: 'varchar',
    length: 50,
    default: ScammerStatus.PENDING,
  })
  status: ScammerStatus;

  @Column({ nullable: true })
  reportedBy: string | null; // User ID who reported

  @Column({ nullable: true })
  verifiedBy: string | null; // Admin/moderator who verified

  @Column('varchar', { length: 45, nullable: true })
  ipAddress: string | null; // IPv4 or IPv6 address

  @Column('text', { nullable: true })
  additionalInfo: string | null; // Additional information about the scammer

  @Column({ type: 'integer', default: 1 })
  reportCount: number; // Number of times this scammer was reported

  @Column({ type: 'timestamp', nullable: true })
  lastReportedAt: Date | null;

  @Column('varchar', { length: 50, default: 'web' })
  source: string; // Source of the report (web, telegram, api, etc.)

  @Column({ type: 'boolean', default: false })
  isAutoVerified: boolean; // Whether this was auto-verified by the system

  @Column({ type: 'timestamp', nullable: true })
  autoVerifiedAt: Date | null; // When it was auto-verified

  @OneToMany(
    () => ScammerReportInstance,
    (instance) => instance.scammerReport,
    { cascade: true },
  )
  reportInstances: ScammerReportInstance[];

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reportedBy' })
  reporter: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'verifiedBy' })
  verifier: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
