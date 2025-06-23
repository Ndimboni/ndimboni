import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { FileUploadService } from './file-upload.service';
import { GroqService } from './groq.service';
import { ScamAnalysisFormatterService } from './scam-analysis-formatter.service';
import { UploadedFile } from '../../entities/uploaded-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UploadedFile])],
  providers: [
    EmailService,
    FileUploadService,
    GroqService,
    ScamAnalysisFormatterService,
  ],
  exports: [
    EmailService,
    FileUploadService,
    GroqService,
    ScamAnalysisFormatterService,
  ],
})
export class CommonServicesModule {}
