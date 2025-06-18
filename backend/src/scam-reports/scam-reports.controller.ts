import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  ScamReportsService,
  CreateScamReportDto,
  UpdateScamReportDto,
} from './scam-reports.service';
import { PolicyGuard } from '../common/guards/policy.guard';
import { RequirePolicy } from '../common/decorators/policy.decorator';
import { ScamStatus } from '../entities/scam-report.entity';
import { Action, Resource } from '../common/interfaces/policy.interface';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('scam-reports')
@Controller('scam-reports')
export class ScamReportsController {
  constructor(private readonly scamReportsService: ScamReportsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all scam reports' })
  @ApiResponse({ status: 200, description: 'List of scam reports' })
  async findAll(@Query('userId') userId?: string) {
    if (userId) {
      return this.scamReportsService.findByUser(userId);
    }
    return this.scamReportsService.findAll();
  }

  @Get('stats')
  @UseGuards(PolicyGuard)
  @RequirePolicy(Action.READ, Resource.SCAM_REPORT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get scam reports statistics' })
  @ApiResponse({ status: 200, description: 'Scam reports statistics' })
  async getStats() {
    return this.scamReportsService.getStats();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a scam report by ID' })
  @ApiResponse({ status: 200, description: 'Scam report details' })
  @ApiResponse({ status: 404, description: 'Scam report not found' })
  async findById(@Param('id') id: string) {
    return this.scamReportsService.findById(id);
  }

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new scam report' })
  @ApiResponse({ status: 201, description: 'Scam report created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() createDto: CreateScamReportDto, @Request() req?: any) {
    const user = req?.user; // User is optional for anonymous reports
    return this.scamReportsService.create(createDto, user);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a scam report' })
  @ApiResponse({ status: 200, description: 'Scam report updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Scam report not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateScamReportDto,
    @Request() req: any,
  ) {
    return this.scamReportsService.update(id, updateDto, req.user);
  }

  @Put(':id/status')
  @UseGuards(PolicyGuard)
  @RequirePolicy(Action.UPDATE, Resource.SCAM_REPORT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update scam report status (Admin/Moderator only)' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ScamStatus,
    @Request() req: any,
  ) {
    return this.scamReportsService.update(id, { status }, req.user);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a scam report' })
  @ApiResponse({ status: 200, description: 'Scam report deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Scam report not found' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.scamReportsService.delete(id, req.user);
  }
}
