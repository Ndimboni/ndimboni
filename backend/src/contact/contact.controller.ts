import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ContactService } from './contact.service';
import {
  CreateContactDto,
  UpdateContactStatusDto,
  ContactResponseDto,
  ContactFiltersDto,
} from '../dto/contact.dto';
import { Public } from '../common/decorators/public.decorator';
import { PolicyGuard } from '../common/guards/policy.guard';
import { RequirePolicy } from '../common/decorators/policy.decorator';
import { Action, Resource } from '../common/interfaces/policy.interface';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit a contact message' })
  @ApiResponse({
    status: 201,
    description: 'Contact message submitted successfully',
    type: ContactResponseDto,
  })
  async create(
    @Body() createContactDto: CreateContactDto,
    @Request() req?: any,
  ): Promise<ContactResponseDto> {
    return this.contactService.create(createContactDto, req?.user);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(PolicyGuard)
  @RequirePolicy(Action.READ, Resource.CONTACT)
  @ApiOperation({ summary: 'Get all contact messages (Admin/Moderator only)' })
  @ApiResponse({
    status: 200,
    description: 'Contact messages retrieved successfully',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'in_progress', 'resolved', 'closed'],
  })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query() filters: ContactFiltersDto) {
    return this.contactService.findAll(filters);
  }

  @Get('stats')
  @ApiBearerAuth()
  @UseGuards(PolicyGuard)
  @RequirePolicy(Action.READ, Resource.CONTACT)
  @ApiOperation({ summary: 'Get contact statistics (Admin/Moderator only)' })
  @ApiResponse({
    status: 200,
    description: 'Contact statistics retrieved successfully',
  })
  async getStats() {
    return this.contactService.getContactStats();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(PolicyGuard)
  @RequirePolicy(Action.READ, Resource.CONTACT)
  @ApiOperation({ summary: 'Get contact message by ID (Admin/Moderator only)' })
  @ApiResponse({
    status: 200,
    description: 'Contact message retrieved successfully',
    type: ContactResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<ContactResponseDto> {
    return this.contactService.findOne(id);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(PolicyGuard)
  @RequirePolicy(Action.UPDATE, Resource.CONTACT)
  @ApiOperation({
    summary: 'Update contact message status (Admin/Moderator only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Contact message status updated successfully',
    type: ContactResponseDto,
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateContactStatusDto,
    @Request() req: any,
  ): Promise<ContactResponseDto> {
    return this.contactService.updateStatus(id, updateStatusDto, req.user);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(PolicyGuard)
  @RequirePolicy(Action.DELETE, Resource.CONTACT)
  @ApiOperation({ summary: 'Delete contact message (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Contact message deleted successfully',
  })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.contactService.delete(id);
    return { message: 'Contact message deleted successfully' };
  }
}
