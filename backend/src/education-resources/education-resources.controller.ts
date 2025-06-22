import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { EducationResourcesService } from './education-resources.service';
import {
  CreateEducationResourceDto,
  UpdateEducationResourceDto,
} from '../dto/education-resource.dto';
import { PolicyGuard } from '../common/guards/policy.guard';
import { RequirePolicy } from '../common/decorators/policy.decorator';
import { Action, Resource } from '../common/interfaces/policy.interface';
import { Public } from '../common/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileUploadService } from '../common/services/file-upload.service';

@ApiTags('Education Resources')
@Controller('education-resources')
export class EducationResourcesController {
  constructor(
    private readonly service: EducationResourcesService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all education resources' })
  @ApiResponse({ status: 200, description: 'List of resources' })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a single education resource' })
  @ApiResponse({ status: 200, description: 'Resource found' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post('upload-image')
  @ApiBearerAuth()
  @UseGuards(PolicyGuard)
  @RequirePolicy(Action.CREATE, Resource.ADMIN_PANEL)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|jpg)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiOperation({ summary: 'Upload an image for an education resource' })
  @ApiResponse({ status: 201, description: 'Image uploaded' })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    const uploaded = await this.fileUploadService.uploadFile(file);
    return { imageUrl: `/uploads/${uploaded.filename}` };
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(PolicyGuard)
  @RequirePolicy(Action.CREATE, Resource.ADMIN_PANEL)
  @ApiOperation({ summary: 'Create a new education resource (Admin only)' })
  @ApiResponse({ status: 201, description: 'Resource created' })
  async create(@Body() dto: CreateEducationResourceDto) {
    // If imageUrl is not provided, reject
    if (!dto.imageUrl) {
      throw new BadRequestException(
        'imageUrl is required. Upload an image or provide a link.',
      );
    }
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(PolicyGuard)
  @RequirePolicy(Action.UPDATE, Resource.ADMIN_PANEL)
  @ApiOperation({ summary: 'Update an education resource (Admin only)' })
  @ApiResponse({ status: 200, description: 'Resource updated' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEducationResourceDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(PolicyGuard)
  @RequirePolicy(Action.DELETE, Resource.ADMIN_PANEL)
  @ApiOperation({ summary: 'Delete an education resource (Admin only)' })
  @ApiResponse({ status: 200, description: 'Resource deleted' })
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { message: 'Resource deleted' };
  }
}
