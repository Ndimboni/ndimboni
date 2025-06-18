import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PolicyGuard } from '../common/guards/policy.guard';
import { RequirePolicy } from '../common/decorators/policy.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Action, Resource } from '../common/interfaces/policy.interface';
import {
  ScamCheckService,
  ScamCheckRequest,
  ScamCheckResponse,
  ScamCheckStats,
} from './scam-check.service';
import {
  CheckMessageDto,
  GetCheckByIdParamDto,
  DeleteCheckParamDto,
  GetChecksQueryDto,
  GetStatsQueryDto,
  GetRecentChecksQueryDto,
  GetAllChecksQueryDto,
} from '../dto/scam-check.dto';

export interface CheckMessageResponse {
  success: boolean;
  data: ScamCheckResponse;
  message: string;
}

export interface GetChecksResponse {
  success: boolean;
  data: ScamCheckResponse[];
  total: number;
  message: string;
}

export interface GetStatsResponse {
  success: boolean;
  data: ScamCheckStats;
  message: string;
}

@ApiTags('Scam Check')
@Controller('api/scam-check')
export class ScamCheckController {
  private readonly logger = new Logger(ScamCheckController.name);

  constructor(private readonly scamCheckService: ScamCheckService) {}

  @Public()
  @Post('check')
  @ApiOperation({ summary: 'Check message for scam patterns' })
  @ApiResponse({
    status: 200,
    description: 'Message checked successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async checkMessage(
    @Body() dto: CheckMessageDto,
    @Request() req: any,
  ): Promise<CheckMessageResponse> {
    try {
      if (!dto.message || dto.message.trim().length === 0) {
        throw new HttpException('Message is required', HttpStatus.BAD_REQUEST);
      }

      if (dto.message.length > 10000) {
        throw new HttpException(
          'Message is too long (max 10000 characters)',
          HttpStatus.BAD_REQUEST,
        );
      }

      const request: ScamCheckRequest = {
        message: dto.message.trim(),
        checkedBy: req.user?.id,
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const result = await this.scamCheckService.checkMessage(request);

      this.logger.log(`Scam check completed for message: ${result.id}`);

      return {
        success: true,
        data: result,
        message: 'Message checked successfully',
      };
    } catch (error) {
      this.logger.error('Error checking message:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to check message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('check/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get scam check by ID' })
  @ApiResponse({
    status: 200,
    description: 'Check retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Check not found',
  })
  async getCheckById(
    @Param() params: GetCheckByIdParamDto,
  ): Promise<CheckMessageResponse> {
    try {
      const result = await this.scamCheckService.getCheckById(params.id);

      if (!result) {
        throw new HttpException('Check not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: result,
        message: 'Check retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error getting check by ID:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to retrieve check',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('my-checks')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get current user's scam checks" })
  @ApiResponse({
    status: 200,
    description: 'Checks retrieved successfully',
  })
  @ApiBearerAuth()
  async getMyChecks(
    @Request() req: any,
    @Query() query: GetChecksQueryDto,
  ): Promise<GetChecksResponse> {
    try {
      const results = await this.scamCheckService.getChecksByUser(
        req.user.id,
        query.limit,
        query.offset,
      );

      return {
        success: true,
        data: results,
        total: results.length,
        message: 'Checks retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error getting user checks:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to retrieve checks',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('recent')
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePolicy(Action.READ, Resource.BOT_SETTINGS)
  @ApiOperation({ summary: 'Get recent scam checks (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Recent checks retrieved successfully',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async getRecentChecks(
    @Query() query: GetRecentChecksQueryDto,
  ): Promise<GetChecksResponse> {
    try {
      const results = await this.scamCheckService.getRecentChecks(query.limit);

      return {
        success: true,
        data: results,
        total: results.length,
        message: 'Recent checks retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error getting recent checks:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to retrieve recent checks',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePolicy(Action.READ, Resource.BOT_SETTINGS)
  @ApiOperation({ summary: 'Get scam check statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  @ApiBearerAuth()
  async getStats(@Query() query: GetStatsQueryDto): Promise<GetStatsResponse> {
    try {
      const stats = await this.scamCheckService.getStats(query.days);

      return {
        success: true,
        data: stats,
        message: 'Statistics retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error getting scam check stats:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to retrieve statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('check/:id/delete')
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePolicy(Action.DELETE, Resource.BOT_SETTINGS)
  @ApiOperation({ summary: 'Delete a scam check (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Check deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Check not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  @ApiBearerAuth()
  async deleteCheck(
    @Param() params: DeleteCheckParamDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const deleted = await this.scamCheckService.deleteCheck(params.id);

      if (!deleted) {
        throw new HttpException('Check not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        message: 'Check deleted successfully',
      };
    } catch (error) {
      this.logger.error('Error deleting check:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to delete check',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePolicy(Action.READ, Resource.BOT_SETTINGS)
  @ApiOperation({
    summary: 'Get all scam checks with pagination and filtering (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'All checks retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  @ApiBearerAuth()
  async getAllChecks(@Query() query: GetAllChecksQueryDto): Promise<{
    success: boolean;
    data: any[];
    total: number;
    limit: number;
    offset: number;
    message: string;
  }> {
    try {
      const fromDateObj = query.fromDate ? new Date(query.fromDate) : undefined;
      const toDateObj = query.toDate ? new Date(query.toDate) : undefined;

      const result = await this.scamCheckService.getAllChecks(
        query.limit,
        query.offset,
        query.status as any,
        query.intent as any,
        fromDateObj,
        toDateObj,
      );

      return {
        success: true,
        data: result.data,
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        message: 'All checks retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error getting all checks:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to retrieve all checks',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
