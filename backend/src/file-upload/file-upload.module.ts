import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { AuthzModule } from '../authz/authz.module';
import { UploadedFile } from '../entities/uploaded-file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UploadedFile]),
    AuthzModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        limits: {
          fileSize: configService.get<number>('upload.maxFileSize'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [FileUploadService],
  controllers: [FileUploadController],
  exports: [FileUploadService],
})
export class FileUploadModule {}
