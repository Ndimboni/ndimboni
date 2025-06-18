import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PolicyGuard } from '../common/guards/policy.guard';
import { RequirePolicy } from '../common/decorators/policy.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Action, Resource } from '../common/interfaces/policy.interface';
import {
  ScammerReportService,
  CreateScammerReportRequest,
  UpdateScammerReportRequest,
  ScammerReportResponse,
  ScammerReportStats,
  SearchScammerRequest,
} from './scammer-report.service';
import {
  CreateScammerReportDto,
  CheckScammerDto,
  UpdateScammerReportDto,
  SearchScammerReportsQueryDto,
  GetPendingReportsQueryDto,
  GetStatsQueryDto,
} from '../dto/scammer-reports.dto';
import { ScammerType, ScammerStatus } from '../entities/scammer-report.entity';

export interface ReportResponse {
  success: boolean;
  data: ScammerReportResponse;
  message: string;
}

export interface ReportsResponse {
  success: boolean;
  data: ScammerReportResponse[];
  total: number;
  message: string;
}

export interface StatsResponse {
  success: boolean;
  data: ScammerReportStats;
  message: string;
}

export interface CheckScammerResponse {
  success: boolean;
  isScammer: boolean;
  data?: ScammerReportResponse;
  message: string;
}

@ApiTags('Scammer Reports')
@Controller('api/scammer-reports')
export class ScammerReportController {
  private readonly logger = new Logger(ScammerReportController.name);

  constructor(private readonly scammerReportService: ScammerReportService) {}

  @Public()
  @Post('report')
  @ApiOperation({ summary: 'Report a scammer' })
  @ApiResponse({
    status: 201,
    description: 'Scammer reported successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async createReport(
    @Body() dto: CreateScammerReportDto,
    @Request() req: any,
  ): Promise<ReportResponse> {
    try {
      // Validate input
      if (!dto.type || !Object.values(ScammerType).includes(dto.type)) {
        throw new HttpException('Invalid scammer type', HttpStatus.BAD_REQUEST);
      }

      if (!dto.identifier || dto.identifier.trim().length === 0) {
        throw new HttpException(
          'Identifier is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!dto.description || dto.description.trim().length < 10) {
        throw new HttpException(
          'Description must be at least 10 characters',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (dto.description.length > 2000) {
        throw new HttpException(
          'Description is too long (max 2000 characters)',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate identifier format based on type
      if (dto.type === ScammerType.EMAIL) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(dto.identifier)) {
          throw new HttpException(
            'Invalid email format',
            HttpStatus.BAD_REQUEST,
          );
        }
      } else if (dto.type === ScammerType.PHONE) {
        const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(dto.identifier.replace(/[\s\-()]/g, ''))) {
          throw new HttpException(
            'Invalid phone number format',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const request: CreateScammerReportRequest = {
        type: dto.type,
        identifier: dto.identifier.trim(),
        description: dto.description.trim(),
        evidence: dto.evidence,
        additionalInfo: dto.additionalInfo?.trim(),
        reportedBy: req.user?.id,
        ipAddress: req.ip || req.connection?.remoteAddress,
      };

      const result = await this.scammerReportService.createReport(request);

      this.logger.log(`Scammer report created: ${result.id}`);

      return {
        success: true,
        data: result,
        message: 'Scammer reported successfully',
      };
    } catch (error) {
      this.logger.error('Error creating scammer report:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to create scammer report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Post('check')
  @ApiOperation({ summary: 'Check if an email or phone is a known scammer' })
  @ApiResponse({
    status: 200,
    description: 'Check completed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async checkScammer(
    @Body() dto: CheckScammerDto,
  ): Promise<CheckScammerResponse> {
    try {
      if (!dto.type || !Object.values(ScammerType).includes(dto.type)) {
        throw new HttpException('Invalid scammer type', HttpStatus.BAD_REQUEST);
      }

      if (!dto.identifier || dto.identifier.trim().length === 0) {
        throw new HttpException(
          'Identifier is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.scammerReportService.checkScammer(
        dto.type,
        dto.identifier.trim(),
      );

      return {
        success: true,
        isScammer: !!result,
        data: result || undefined,
        message: result
          ? 'Scammer found in database'
          : 'No scammer record found',
      };
    } catch (error) {
      this.logger.error('Error checking scammer:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to check scammer',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('report/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get scammer report by ID' })
  @ApiResponse({
    status: 200,
    description: 'Report retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  async getReportById(@Param('id') id: string): Promise<ReportResponse> {
    try {
      const result = await this.scammerReportService.getReportById(id);

      if (!result) {
        throw new HttpException('Report not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: result,
        message: 'Report retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error getting report by ID:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to retrieve report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get('report/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all scammers' })
  @ApiResponse({
    status: 200,
    description: 'Report retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  async getAll(): Promise<ReportsResponse> {
    try {
      const result = await this.scammerReportService.getAllReports();

      if (!result) {
        throw new HttpException('No reports found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: result?.data,
        total: result?.total || 0,

        message: 'Report retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error getting report by ID:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to retrieve report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('report/:id')
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePolicy(Action.UPDATE, Resource.BOT_SETTINGS)
  @ApiOperation({ summary: 'Update scammer report (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Report updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async updateReport(
    @Param('id') id: string,
    @Body() dto: UpdateScammerReportDto,
    @Request() req: any,
  ): Promise<ReportResponse> {
    try {
      if (dto.status && !Object.values(ScammerStatus).includes(dto.status)) {
        throw new HttpException('Invalid status', HttpStatus.BAD_REQUEST);
      }

      const request: UpdateScammerReportRequest = {
        status: dto.status,
        additionalInfo: dto.additionalInfo?.trim(),
        verifiedBy: req.user.id,
      };

      const result = await this.scammerReportService.updateReport(id, request);

      if (!result) {
        throw new HttpException('Report not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: result,
        message: 'Report updated successfully',
      };
    } catch (error) {
      this.logger.error('Error updating report:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to update report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search')
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePolicy(Action.READ, Resource.BOT_SETTINGS)
  async searchReports(
    @Query('query') query?: string,
    @Query('type') type?: ScammerType,
    @Query('status') status?: ScammerStatus,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<ReportsResponse> {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 50;
      const offsetNum = offset ? parseInt(offset, 10) : 0;

      if (limitNum > 200) {
        throw new HttpException(
          'Limit cannot exceed 200',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (type && !Object.values(ScammerType).includes(type)) {
        throw new HttpException('Invalid type filter', HttpStatus.BAD_REQUEST);
      }

      if (status && !Object.values(ScammerStatus).includes(status)) {
        throw new HttpException(
          'Invalid status filter',
          HttpStatus.BAD_REQUEST,
        );
      }

      const searchRequest: SearchScammerRequest = {
        query,
        type,
        status,
        limit: limitNum,
        offset: offsetNum,
      };

      const results =
        await this.scammerReportService.searchReports(searchRequest);

      return {
        success: true,
        data: results,
        total: results.length,
        message: 'Reports retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error searching reports:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to search reports',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('my-reports')
  @UseGuards(JwtAuthGuard)
  async getMyReports(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<ReportsResponse> {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 20;
      const offsetNum = offset ? parseInt(offset, 10) : 0;

      if (limitNum > 100) {
        throw new HttpException(
          'Limit cannot exceed 100',
          HttpStatus.BAD_REQUEST,
        );
      }

      const results = await this.scammerReportService.getReportsByUser(
        req.user.id,
        limitNum,
        offsetNum,
      );

      return {
        success: true,
        data: results,
        total: results.length,
        message: 'Reports retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error getting user reports:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to retrieve reports',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePolicy(Action.READ, Resource.BOT_SETTINGS)
  async getPendingReports(
    @Query('limit') limit?: string,
  ): Promise<ReportsResponse> {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 50;

      if (limitNum > 200) {
        throw new HttpException(
          'Limit cannot exceed 200',
          HttpStatus.BAD_REQUEST,
        );
      }

      const results =
        await this.scammerReportService.getPendingReports(limitNum);

      return {
        success: true,
        data: results,
        total: results.length,
        message: 'Pending reports retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error getting pending reports:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to retrieve pending reports',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePolicy(Action.READ, Resource.BOT_SETTINGS)
  async getStats(@Query('days') days?: string): Promise<StatsResponse> {
    try {
      const daysNum = days ? parseInt(days, 10) : 30;

      if (daysNum > 365) {
        throw new HttpException(
          'Days cannot exceed 365',
          HttpStatus.BAD_REQUEST,
        );
      }

      const stats = await this.scammerReportService.getStats(daysNum);

      return {
        success: true,
        data: stats,
        message: 'Statistics retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error getting scammer report stats:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to retrieve statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('report/:id/delete')
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePolicy(Action.DELETE, Resource.BOT_SETTINGS)
  async deleteReport(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const deleted = await this.scammerReportService.deleteReport(id);

      if (!deleted) {
        throw new HttpException('Report not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        message: 'Report deleted successfully',
      };
    } catch (error) {
      this.logger.error('Error deleting report:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to delete report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePolicy(Action.READ, Resource.BOT_SETTINGS)
  @ApiOperation({
    summary:
      'Get all scammer reports with pagination and filtering (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'All scammer reports retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async getAllReports(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('query') query?: string,
  ): Promise<{
    success: boolean;
    data: any[];
    total: number;
    limit: number;
    offset: number;
    message: string;
  }> {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 100;
      const offsetNum = offset ? parseInt(offset, 10) : 0;

      if (limitNum > 1000) {
        throw new HttpException(
          'Limit cannot exceed 1000',
          HttpStatus.BAD_REQUEST,
        );
      }

      const fromDateObj = fromDate ? new Date(fromDate) : undefined;
      const toDateObj = toDate ? new Date(toDate) : undefined;

      const result = await this.scammerReportService.getAllReports(
        limitNum,
        offsetNum,
        status as any,
        type as any,
        fromDateObj,
        toDateObj,
        query,
      );

      return {
        success: true,
        data: result.data,
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        message: 'All scammer reports retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error getting all scammer reports:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to retrieve all scammer reports',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
