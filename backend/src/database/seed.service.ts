import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { UserRole } from '../common/interfaces/user.interface';
import { AdminConfig } from '../common/interfaces/config.interface';
import * as bcrypt from 'bcrypt';
import {
  EducationResource,
  ResourceStatus,
} from '../entities/education-resource.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(EducationResource)
    private readonly resourceRepository: Repository<EducationResource>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedAdminUser();
    await this.seedModeratorUser();
    await this.seedEducationResources();
  }

  private async seedAdminUser(): Promise<void> {
    try {
      const adminConfig = this.configService.get<AdminConfig>('admin');
      if (!adminConfig) {
        this.logger.error('Admin configuration not found');
        return;
      }

      const existingAdmin = await this.userRepository.findOne({
        where: { role: UserRole.ADMIN },
      });

      if (!existingAdmin) {
        this.logger.log('No admin user found. Creating default admin user...');

        const hashedPassword = await bcrypt.hash(adminConfig.password, 10);

        const adminUser = this.userRepository.create({
          email: adminConfig.email,
          name: adminConfig.name,
          password: hashedPassword,
          role: UserRole.ADMIN,
          isActive: true,
        });

        await this.userRepository.save(adminUser);
        this.logger.log(
          `Admin user created successfully with email: ${adminConfig.email}`,
        );
      } else {
        this.logger.log('Admin user already exists');
      }
    } catch (error) {
      this.logger.error('Failed to seed admin user:', (error as Error).message);
    }
  }

  private async seedModeratorUser(): Promise<void> {
    try {
      const moderatorConfig = this.configService.get<AdminConfig>('moderator');
      if (!moderatorConfig) {
        this.logger.error('Moderator configuration not found');
        return;
      }

      const existingModerator = await this.userRepository.findOne({
        where: { role: UserRole.MODERATOR },
      });

      if (!existingModerator) {
        this.logger.log(
          'No moderator user found. Creating default moderator user...',
        );

        const hashedPassword = await bcrypt.hash(moderatorConfig.password, 10);

        const moderatorUser = this.userRepository.create({
          email: moderatorConfig.email,
          name: moderatorConfig.name,
          password: hashedPassword,
          role: UserRole.MODERATOR,
          isActive: true,
        });

        await this.userRepository.save(moderatorUser);
        this.logger.log(
          `Moderator user created successfully with email: ${moderatorConfig.email}`,
        );
      } else {
        this.logger.log('Moderator user already exists');
      }
    } catch (error) {
      this.logger.error(
        'Failed to seed moderator user:',
        (error as Error).message,
      );
    }
  }

  private async seedEducationResources(): Promise<void> {
    const count = await this.resourceRepository.count();
    if (count > 0) {
      this.logger.log('Education resources already seeded');
      return;
    }
    // Create parent categories
    const parentAwareness = this.resourceRepository.create({
      title: 'Scam Awareness',
      description: 'Learn how to recognize and avoid scams in Rwanda.',
      category: 'Awareness',
      imageUrl: '',
      status: ResourceStatus.PUBLISHED,
    });
    await this.resourceRepository.save(parentAwareness);

    const parentProtection = this.resourceRepository.create({
      title: 'Protecting Yourself Online',
      description:
        'Best practices for protecting your personal information and accounts.',
      category: 'Protection',
      imageUrl: '',
      status: ResourceStatus.PUBLISHED,
    });
    await this.resourceRepository.save(parentProtection);

    // Child resources under Awareness
    const resource1 = this.resourceRepository.create({
      title: 'How to Spot a Scam Message',
      description:
        'Learn the common signs of scam messages and how to avoid falling victim.',
      category: 'Awareness',
      url: 'https://www.cybersecurity.rw/scam-awareness',
      imageUrl: '',
      parent: parentAwareness,
      status: ResourceStatus.PUBLISHED,
    });
    await this.resourceRepository.save(resource1);

    const resource2 = this.resourceRepository.create({
      title: 'Common Scam Tactics in Rwanda',
      description:
        'Examples of common scams targeting Rwandans and how to avoid them.',
      category: 'Awareness',
      url: 'https://www.cybersecurity.rw/common-scams',
      imageUrl: '',
      parent: parentAwareness,
      nextResource: resource1, // resource2 -> resource1
      status: ResourceStatus.PUBLISHED,
    });
    await this.resourceRepository.save(resource2);

    // Child resources under Protection
    const resource3 = this.resourceRepository.create({
      title: 'Protecting Your Personal Information',
      description:
        'Tips on keeping your personal data safe from scammers online.',
      category: 'Protection',
      url: 'https://www.cybersecurity.rw/protect-info',
      imageUrl: '',
      parent: parentProtection,
      status: ResourceStatus.DRAFT, // This one is a draft for testing
    });
    await this.resourceRepository.save(resource3);

    const resource4 = this.resourceRepository.create({
      title: 'Using Strong Passwords',
      description:
        'How to create and manage strong passwords to secure your accounts.',
      category: 'Protection',
      url: 'https://www.cybersecurity.rw/passwords',
      imageUrl: '',
      parent: parentProtection,
      nextResource: resource3, // resource4 -> resource3
      status: ResourceStatus.PUBLISHED,
    });
    await this.resourceRepository.save(resource4);

    // Standalone resource for reporting
    const resource5 = this.resourceRepository.create({
      title: 'Reporting Scams in Rwanda',
      description:
        'How and where to report scams and suspicious activity in Rwanda.',
      category: 'Reporting',
      url: 'https://www.cybersecurity.rw/report-scam',
      imageUrl: '',
      status: ResourceStatus.PUBLISHED,
    });
    await this.resourceRepository.save(resource5);

    this.logger.log('Sample hierarchical education resources seeded');
  }
}
