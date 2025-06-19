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

  @Column('varchar', { length: 255, nullable: true })
  reportedBy: string | null; // User ID who reported

  @Column('varchar', { length: 255, nullable: true })
  verifiedBy: string | null; // Admin/moderator who verified

  @Column('varchar', { length: 45, nullable: true })
  ipAddress: string | null; // IPv4 or IPv6 address

  @Column('text', { nullable: true })
  additionalInfo: string | null; // Additional information about the scammer

  @Column('int', { default: 1 })
  reportCount: number; // Number of times this scammer was reported

  @Column('datetime', { nullable: true })
  lastReportedAt: Date | null;

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
