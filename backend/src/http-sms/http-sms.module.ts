import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpSmsService } from './http-sms.service';
import { HttpSmsController } from './http-sms.controller';
import { ScamCheckModule } from '../scam-check/scam-check.module';
import { ScammerReportsModule } from '../scammer-reports/scammer-reports.module';
import { CommonServicesModule } from '../common/services/common-services.module';

@Module({
  imports: [
    ConfigModule,
    ScamCheckModule,
    ScammerReportsModule,
    CommonServicesModule,
  ],
  providers: [HttpSmsService],
  controllers: [HttpSmsController],
  exports: [HttpSmsService],
})
export class HttpSmsModule {}
