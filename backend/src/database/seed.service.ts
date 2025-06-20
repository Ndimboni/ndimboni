import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { UserRole } from '../common/interfaces/user.interface';
import { AdminConfig } from '../common/interfaces/config.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedAdminUser();
    await this.seedModeratorUser();
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
}
