import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScamReport } from '../entities/scam-report.entity';
import { AuthzModule } from '../authz/authz.module';
import { ScamReportsService } from './scam-reports.service';
import { ScamReportsController } from './scam-reports.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ScamReport]), AuthzModule],
  providers: [ScamReportsService],
  controllers: [ScamReportsController],
  exports: [ScamReportsService],
})
export class ScamReportsModule {}
