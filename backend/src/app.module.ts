import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { AuthzModule } from './authz/authz.module';
import { UsersModule } from './users/users.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { SmsModule } from './sms-service/sms.module';
import { ScamReportsModule } from './scam-reports/scam-reports.module';
import { ScamCheckModule } from './scam-check/scam-check.module';
import { ScammerReportsModule } from './scammer-reports/scammer-reports.module';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    DatabaseModule,
    AuthModule,
    AuthzModule,
    UsersModule,
    FileUploadModule,
    SmsModule,
    ScamReportsModule,
    ScamCheckModule,
    ScammerReportsModule,
    TelegramBotModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
