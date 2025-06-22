import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScamReport } from '../entities/scam-report.entity';
import { User } from '../entities/user.entity';
import { ScamCheckModule } from '../scam-check/scam-check.module';
import { ScammerReportsModule } from '../scammer-reports/scammer-reports.module';
import { AuthzModule } from '../authz/authz.module';
import { CommonServicesModule } from '../common/services/common-services.module';
import { WhatsappWebhookService } from './whatsapp-webhook.service';
import { WhatsappBotService } from './whatsapp-bot.service';
import { WhatsappBotController } from './whatsapp-bot.controller';
import { WhatsappApiService } from './whatsapp-api.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ScamReport, User]),
    ScamCheckModule,
    ScammerReportsModule,
    AuthzModule,
    CommonServicesModule,
  ],
  providers: [WhatsappBotService, WhatsappWebhookService, WhatsappApiService],
  controllers: [WhatsappBotController],
  exports: [WhatsappBotService],
})
export class WhatsappBotModule {}
