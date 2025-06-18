import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { FileUploadService } from './file-upload.service';
import { UploadedFile } from '../../entities/uploaded-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UploadedFile])],
  providers: [EmailService, FileUploadService],
  exports: [EmailService, FileUploadService],
})
export class CommonServicesModule {}
