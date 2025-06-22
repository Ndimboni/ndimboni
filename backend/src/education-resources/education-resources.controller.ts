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
  ApiConsumes,
  ApiBody,
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
import { ResourceStatus } from '../entities/education-resource.entity';

@ApiTags('Education Resources')
@Controller('education-resources')
export class EducationResourcesController {
  constructor(
    private readonly service: EducationResourcesService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(PolicyGuard)
  @RequirePolicy(Action.READ, Resource.ADMIN_PANEL)
  @ApiOperation({ summary: 'Get all education resources (Admin view)' })
  @ApiResponse({ status: 200, description: 'List of all resources' })
  async findAll() {
    return this.service.findAll();
  }

  @Get('published')
  @Public()
  @ApiOperation({ summary: 'Get published education resources (Public view)' })
  @ApiResponse({ status: 200, description: 'List of published resources' })
  async findPublished() {
    return this.service.findPublished();
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get a single education resource (only published for public)',
  })
  @ApiResponse({ status: 200, description: 'Resource found' })
  async findOne(@Param('id') id: string) {
    const resource = await this.service.findOne(id);

    // For public access, only return published resources
    // Admin access would use different endpoint with authentication
    if (resource.status !== ResourceStatus.PUBLISHED) {
      throw new BadRequestException('Resource not available');
    }

    return resource;
  }

  @Get('admin/:id')
  @ApiBearerAuth()
  @UseGuards(PolicyGuard)
  @RequirePolicy(Action.READ, Resource.ADMIN_PANEL)
  @ApiOperation({ summary: 'Get a single education resource (Admin view)' })
  @ApiResponse({ status: 200, description: 'Resource found' })
  async findOneAdmin(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post('upload-image')
  @ApiBearerAuth()
  @UseGuards(PolicyGuard)
  @RequirePolicy(Action.CREATE, Resource.ADMIN_PANEL)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/public',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
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
    return { imageUrl: `/uploads/public/${uploaded.filename}` };
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(PolicyGuard)
  @RequirePolicy(Action.CREATE, Resource.ADMIN_PANEL)
  @ApiOperation({ summary: 'Create a new education resource (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Education resource form data',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title of the resource' },
        description: {
          type: 'string',
          description: 'Description of the resource',
        },
        url: { type: 'string', description: 'URL to the resource (optional)' },
        imageUrl: {
          type: 'string',
          description: 'Image URL (optional, if not uploading file)',
        },
        category: {
          type: 'string',
          description: 'Category of the resource (optional)',
        },
        status: {
          type: 'string',
          enum: ['draft', 'published'],
          description: 'Status of the resource (optional, defaults to draft)',
          default: 'draft',
        },
        nextResourceId: {
          type: 'string',
          description: 'ID of the next resource in sequence (optional)',
        },
        parentId: {
          type: 'string',
          description: 'ID of the parent resource (optional)',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload (optional)',
        },
      },
      required: ['title', 'description'],
    },
  })
  @ApiResponse({ status: 201, description: 'Resource created' })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/public',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
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
  async create(
    @UploadedFile() image: Express.Multer.File,
    @Body() dto: any, // Use any for multipart form data to avoid validation issues
  ) {
    // Validate required fields manually
    if (!dto.title || !dto.description) {
      throw new BadRequestException('Title and description are required');
    }

    let imageUrl = dto.imageUrl;
    if (image) {
      imageUrl = `/uploads/public/${image.filename}`;
    }
    if (!imageUrl) {
      throw new BadRequestException(
        'image is required. Upload an image or provide a link.',
      );
    }
    // Support linking nextResource and parent
    return this.service.create({
      title: dto.title,
      description: dto.description,
      url: dto.url,
      category: dto.category,
      imageUrl,
      nextResourceId: dto.nextResourceId,
      parentId: dto.parentId,
      status: dto.status || ResourceStatus.DRAFT,
    });
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
