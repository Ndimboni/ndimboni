import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Serve static files from uploads/public directory
  app.useStaticAssets(join(__dirname, '..', 'uploads', 'public'), {
    prefix: '/uploads/public/',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are provided
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Allow conversion of primitive types
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: configService.get<string>('cors.origin'),
    credentials: configService.get<boolean>('cors.credentials'),
  });

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('Ndimboni API')
    .setDescription('Digital Scam Protection Platform API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('authentication', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('Scam Check', 'Message scam detection and analysis')
    .addTag('Scammer Reports', 'Report and manage known scammers')
    .addTag('Telegram Bot', 'Telegram bot management and configuration')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get<number>('port') || 3000;
  await app.listen(port);

  // Clear startup messages with some spacing
  console.log('\n'.repeat(2));
  logger.log('🎉 =================================');
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  logger.log('🎉 =================================');
  console.log('\n');
}
bootstrap().catch((error) => {
  console.error('Error starting the application:', error);
  process.exit(1);
});
