import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScammerReport } from '../../entities/scammer-report.entity';
import { ScammerReportInstance } from '../../entities/scammer-report-instance.entity';
import { AutoVerificationService } from './auto-verification.service';
import { AutoVerificationSchedulerService } from './auto-verification-scheduler.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScammerReport, ScammerReportInstance]),
    ConfigModule,
  ],
  providers: [AutoVerificationService, AutoVerificationSchedulerService],
  exports: [AutoVerificationService, AutoVerificationSchedulerService],
})
export class AutoVerificationModule {}
