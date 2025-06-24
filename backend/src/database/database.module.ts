import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  User,
  ScamReport,
  UploadedFile,
  ScamCheck,
  ScammerReport,
  ScammerReportInstance,
  EducationResource,
} from '../entities';
import { SeedService } from './seed.service';
import { MigrationService } from './migration.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const dbConfig = configService.get('database');
        return {
          ...dbConfig,
          entities: [
            User,
            ScamReport,
            UploadedFile,
            ScamCheck,
            ScammerReport,
            ScammerReportInstance,
            EducationResource,
          ],
        } as TypeOrmModuleOptions;
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      User,
      ScamReport,
      UploadedFile,
      ScamCheck,
      ScammerReport,
      EducationResource,
    ]),
  ],
  providers: [SeedService, MigrationService],
  exports: [TypeOrmModule, SeedService, MigrationService],
})
export class DatabaseModule {}
