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

export enum ScamType {
  EMAIL = 'email',
  SMS = 'sms',
  PHONE_CALL = 'phone_call',
  SOCIAL_MEDIA = 'social_media',
  WEBSITE = 'website',
  OTHER = 'other',
}

export enum ScamStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  INVESTIGATING = 'investigating',
}

@Entity('scam_reports')
export class ScamReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'varchar',
  })
  scamType: ScamType;

  @Column({
    type: 'varchar',
    default: ScamStatus.PENDING,
  })
  status: ScamStatus;

  @Column({ nullable: true })
  scammerInfo: string;

  @Column({ nullable: true })
  evidenceUrl: string;

  @Column({ nullable: true })
  reporterEmail: string;

  @Column({ nullable: true })
  reporterPhone: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
