import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ScamCheckController } from './scam-check.controller';
import { ScamCheckService } from './scam-check.service';
import { ScamCheck } from '../entities/scam-check.entity';
import { RankingService } from './risk-score-ranking.service';
import { AuthzModule } from '../authz/authz.module';
import { UrlScanningService } from 'src/common/services/url-scanning.service';
import { CommonServicesModule } from '../common/services/common-services.module';
import { ScammerReportsModule } from '../scammer-reports/scammer-reports.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScamCheck]),
    HttpModule,
    AuthzModule,
    CommonServicesModule,
    ScammerReportsModule,
  ],
  controllers: [ScamCheckController],
  providers: [ScamCheckService, UrlScanningService, RankingService],
  exports: [ScamCheckService, RankingService],
})
export class ScamCheckModule {}
