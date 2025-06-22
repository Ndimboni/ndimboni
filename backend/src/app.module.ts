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
import { ScamCheckModule } from './scam-check/scam-check.module';
import { ScammerReportsModule } from './scammer-reports/scammer-reports.module';
import { ContactModule } from './contact/contact.module';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';
import { HttpSmsModule } from './http-sms/http-sms.module';
import { CommonServicesModule } from './common/services/common-services.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import configuration from './config/configuration';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { WhatsappBotModule } from './whatsapp-bot/whatsapp-bot.module';
import { EducationResourcesModule } from './education-resources/education-resources.module';

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
    CommonServicesModule,
    ScamCheckModule,
    ScammerReportsModule,
    ContactModule,
    TelegramBotModule,
    WhatsappBotModule,
    EducationResourcesModule,
    HttpSmsModule,
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
