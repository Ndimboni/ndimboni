import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UploadedFile } from '../entities/uploaded-file.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../common/interfaces/user.interface';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  private uploadPath: string;
  private maxFileSize: number;
  private allowedMimeTypes: string[];

  constructor(
    @InjectRepository(UploadedFile)
    private readonly fileRepository: Repository<UploadedFile>,
    private configService: ConfigService,
  ) {
    this.uploadPath =
      this.configService.get<string>('upload.destination') || './uploads';
    this.maxFileSize =
      this.configService.get<number>('upload.maxFileSize') || 5242880;
    this.allowedMimeTypes = this.configService.get<string[]>(
      'upload.allowedMimeTypes',
    ) || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
    ];

    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    user?: User,
  ): Promise<UploadedFile> {
    // Validate file
    this.validateFile(file);

    const fileId = uuidv4();
    const extension = path.extname(file.originalname);
    const filename = `${fileId}${extension}`;
    const filePath = path.join(this.uploadPath, filename);

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    const uploadedFile = this.fileRepository.create({
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: filePath,
      uploadedById: user?.id,
      uploadedBy: user,
    });

    return this.fileRepository.save(uploadedFile);
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    user?: User,
  ): Promise<UploadedFile[]> {
    const uploadedFiles: UploadedFile[] = [];

    for (const file of files) {
      const uploadedFile = await this.uploadFile(file, user);
      uploadedFiles.push(uploadedFile);
    }

    return uploadedFiles;
  }

  async getFile(fileId: string): Promise<UploadedFile> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
      relations: ['uploadedBy'],
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async getFilesByUser(userId: string): Promise<UploadedFile[]> {
    return this.fileRepository.find({
      where: { uploadedById: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllFiles(): Promise<UploadedFile[]> {
    return this.fileRepository.find({
      relations: ['uploadedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async deleteFile(fileId: string, user: User): Promise<void> {
    const file = await this.getFile(fileId);

    // Check if user owns the file or is admin
    if (file.uploadedById !== user.id && user.role !== UserRole.ADMIN) {
      throw new BadRequestException('You can only delete your own files');
    }

    // Delete file from disk
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Remove from database
    await this.fileRepository.delete(fileId);
  }

  async getFileStream(
    fileId: string,
  ): Promise<{ stream: fs.ReadStream; file: UploadedFile }> {
    const file = await this.getFile(fileId);

    if (!fs.existsSync(file.path)) {
      throw new NotFoundException('File not found on disk');
    }

    const stream = fs.createReadStream(file.path);
    return { stream, file };
  }

  private validateFile(file: Express.Multer.File): void {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum limit of ${this.maxFileSize / (1024 * 1024)}MB`,
      );
    }

    // Check mime type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }
  }
}
