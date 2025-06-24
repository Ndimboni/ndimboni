import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScammerReportController } from './scammer-reports.controller';
import { ScammerReportService } from './scammer-report.service';
import { ScammerReport } from '../entities/scammer-report.entity';
import { ScammerReportInstance } from '../entities/scammer-report-instance.entity';
import { AuthzModule } from '../authz/authz.module';
import { AutoVerificationModule } from '../common/services/auto-verification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScammerReport, ScammerReportInstance]),
    AuthzModule,
    AutoVerificationModule,
  ],
  controllers: [ScammerReportController],
  providers: [ScammerReportService],
  exports: [ScammerReportService],
})
export class ScammerReportsModule {}
