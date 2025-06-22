import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum ResourceStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity('education_resources')
export class EducationResource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  url?: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ nullable: true })
  category?: string;

  @Column({
    type: 'varchar',
    default: ResourceStatus.DRAFT,
  })
  status: ResourceStatus;

  // Link to the user who created the resource
  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'createdById' })
  createdBy?: User;

  // Self-referencing: next resource in the course/sequence
  @ManyToOne(
    () => EducationResource,
    (resource) => resource.previousResources,
    { nullable: true, eager: false },
  )
  @JoinColumn({ name: 'nextResourceId' })
  nextResource?: EducationResource;

  @OneToMany(() => EducationResource, (resource) => resource.nextResource)
  previousResources?: EducationResource[];

  // Optional: parent resource for modules/sections
  @ManyToOne(() => EducationResource, (resource) => resource.children, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: 'parentId' })
  parent?: EducationResource;

  @OneToMany(() => EducationResource, (resource) => resource.parent)
  children?: EducationResource[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
