import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { ScammerReport } from './scammer-report.entity';

@Entity('scammer_report_instances')
@Index(['scammerReport', 'reportedBy'], { unique: true }) // Prevent duplicate reports from same user
export class ScammerReportInstance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ScammerReport, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scammer_report_id' })
  scammerReport: ScammerReport;

  @Column('uuid')
  scammerReportId: string;

  @Column({ nullable: true })
  reportedBy: string | null; // User ID who reported (can be null for anonymous reports)

  @Column('varchar', { length: 45, nullable: true })
  ipAddress: string | null; // IPv4 or IPv6 address

  @Column('text', { nullable: true })
  description: string | null; // User's specific description for this report

  @Column('text', { nullable: true })
  additionalInfo: string | null; // Additional information for this specific report

  @Column('varchar', { length: 50, default: 'web' })
  source: string; // Source of the report (web, telegram, api, etc.)

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reportedBy' })
  reporter: User;

  @CreateDateColumn()
  createdAt: Date;
}
