import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ScamCheckController } from './scam-check.controller';
import { ScamCheckService } from './scam-check.service';
import { UrlScanningService } from '../services/url-scanning.service';
import { ScamCheck } from '../entities/scam-check.entity';
import { TelegramModerationService } from '../telegram-bot/telegram-moderation.service';
import { AuthzModule } from '../authz/authz.module';

@Module({
  imports: [TypeOrmModule.forFeature([ScamCheck]), HttpModule, AuthzModule],
  controllers: [ScamCheckController],
  providers: [ScamCheckService, UrlScanningService, TelegramModerationService],
  exports: [ScamCheckService],
})
export class ScamCheckModule {}
