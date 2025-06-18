import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScammerReportController } from './scammer-reports.controller';
import { ScammerReportService } from './scammer-report.service';
import { ScammerReport } from '../entities/scammer-report.entity';
import { AuthzModule } from '../authz/authz.module';

@Module({
  imports: [TypeOrmModule.forFeature([ScammerReport]), AuthzModule],
  controllers: [ScammerReportController],
  providers: [ScammerReportService],
  exports: [ScammerReportService],
})
export class ScammerReportsModule {}
