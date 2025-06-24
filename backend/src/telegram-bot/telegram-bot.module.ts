import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScamReport } from '../entities/scam-report.entity';
import { User } from '../entities/user.entity';
import { ScamCheckModule } from '../scam-check/scam-check.module';
import { ScammerReportsModule } from '../scammer-reports/scammer-reports.module';
import { AuthzModule } from '../authz/authz.module';
import { CommonServicesModule } from '../common/services/common-services.module';
import { TelegramWebhookService } from './telegram-webhook.service';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramBotController } from './telegram-bot.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ScamReport, User]),
    ScamCheckModule,
    ScammerReportsModule,
    AuthzModule,
    CommonServicesModule,
  ],
  providers: [TelegramBotService, TelegramWebhookService],
  controllers: [TelegramBotController],
})
export class TelegramBotModule {}
