import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { TelegramBotService } from './telegram-bot.service';
// import { TelegramBotController } from './telegram-bot.controller';
// import { TelegramWebhookService } from './telegram-webhook.service';
import { TelegramModerationService } from './telegram-moderation.service';
import { ScamReport } from '../entities/scam-report.entity';
import { User } from '../entities/user.entity';
import { ScamReportsModule } from '../scam-reports/scam-reports.module';
import { AuthzModule } from '../authz/authz.module';
import { TelegramWebhookService } from './telegram-webhook.service';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramBotController } from './telegram-bot.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ScamReport, User]),
    ScamReportsModule,
    AuthzModule,
  ],
  providers: [
    TelegramBotService,
    TelegramWebhookService,
    TelegramModerationService,
  ],
  controllers: [TelegramBotController],
  exports: [TelegramBotService, TelegramModerationService],
})
export class TelegramBotModule {}
