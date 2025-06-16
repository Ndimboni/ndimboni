import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Request,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { Response } from 'express';
import { FileUploadService } from './file-upload.service';
import { PolicyGuard } from '../guards/policy.guard';
import { RequirePolicy } from '../decorators/policy.decorator';
import { Action, Resource } from '../common/interfaces/policy.interface';

@ApiTags('file-upload')
@Controller('files')
@UseGuards(PolicyGuard) // JWT guard is now global, only need policy guard
@ApiBearerAuth()
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @RequirePolicy(Action.CREATE, Resource.FILE)
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file' })
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.fileUploadService.uploadFile(file, req.user);
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  @RequirePolicy(Action.CREATE, Resource.FILE)
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Files uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid files' })
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    return this.fileUploadService.uploadMultipleFiles(files, req.user);
  }

  @Get('my-files')
  @RequirePolicy(Action.READ, Resource.FILE)
  @ApiOperation({ summary: 'Get current user files' })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully' })
  async getMyFiles(@Request() req) {
    return this.fileUploadService.getFilesByUser(req.user.id);
  }

  @Get(':id')
  @RequirePolicy(Action.READ, Resource.FILE)
  @ApiOperation({ summary: 'Get file information' })
  @ApiResponse({
    status: 200,
    description: 'File information retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  async getFile(@Param('id') id: string) {
    return this.fileUploadService.getFile(id);
  }

  @Get(':id/download')
  @RequirePolicy(Action.READ, Resource.FILE)
  @ApiOperation({ summary: 'Download file' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const { stream, file } = await this.fileUploadService.getFileStream(id);

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
      'Content-Length': file.size.toString(),
    });

    stream.pipe(res);
  }

  @Delete(':id')
  @RequirePolicy(Action.DELETE, Resource.FILE)
  @ApiOperation({ summary: 'Delete file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteFile(@Param('id') id: string, @Request() req) {
    await this.fileUploadService.deleteFile(id, req.user);
    return { message: 'File deleted successfully' };
  }
}
