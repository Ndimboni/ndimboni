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

export enum ContactStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum ContactCategory {
  GENERAL_INQUIRY = 'general_inquiry',
  TECHNICAL_SUPPORT = 'technical_support',
  SCAM_REPORT = 'scam_report',
  FEATURE_REQUEST = 'feature_request',
  BUG_REPORT = 'bug_report',
  OTHER = 'other',
}

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  subject: string;

  @Column('text')
  message: string;

  @Column({
    type: 'varchar',
    default: ContactCategory.GENERAL_INQUIRY,
  })
  category: ContactCategory;

  @Column({
    type: 'varchar',
    default: ContactStatus.PENDING,
  })
  status: ContactStatus;

  @Column('text', { nullable: true })
  adminResponse: string;

  @Column({ nullable: true })
  respondedBy: string;

  @Column({ nullable: true })
  respondedAt: Date;

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
