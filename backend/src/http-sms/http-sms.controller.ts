import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { HttpSmsService } from './http-sms.service';
import {
  HttpSmsWebhookDto,
  SmsCheckDto,
  SmsReportDto,
  SmsStatsQueryDto,
} from '../dto/http-sms.dto';

@ApiTags('http-sms')
@Controller('sms')
export class HttpSmsController {
  private readonly logger = new Logger(HttpSmsController.name);

  constructor(private readonly httpSmsService: HttpSmsService) {}

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Handle HTTP SMS webhook (CloudEvents format)',
    description:
      'Webhook endpoint that receives CloudEvents from httpsms.com for SMS processing',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT Bearer token signed with HS256 algorithm',
    required: false,
  })
  @ApiHeader({
    name: 'X-Event-Type',
    description: 'Event type (e.g., message.phone.received)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  async handleWebhook(
    @Body() payload: HttpSmsWebhookDto,
    @Headers('authorization') authHeader?: string,
  ): Promise<any> {
    try {
      const result = await this.httpSmsService.handleWebhook(
        payload,
        authHeader,
      );
      this.logger.log(`Webhook processed: ${payload.type} - ${payload.id}`);
      return result;
    } catch (error) {
      this.logger.error('Error processing webhook:', error);
      return { success: false, message: 'Error processing webhook' };
    }
  }

  @Public()
  @Post('check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check message for scam patterns via SMS API',
    description: 'Analyze a message for scam patterns using the SMS source',
  })
  @ApiResponse({ status: 200, description: 'Message checked successfully' })
  async checkMessage(@Body() dto: SmsCheckDto): Promise<any> {
    const result = await this.httpSmsService.checkMessage(dto);
    return {
      success: true,
      data: result,
      message: 'Message checked successfully',
    };
  }

  @Public()
  @Post('report')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Report a scammer via SMS API',
    description: 'Submit a scammer report with SMS as the source',
  })
  @ApiResponse({ status: 200, description: 'Scammer reported successfully' })
  async reportScammer(@Body() dto: SmsReportDto): Promise<any> {
    const result = await this.httpSmsService.reportScammer(dto);
    return {
      success: true,
      data: result,
      message: 'Scammer reported successfully',
    };
  }

  @Public()
  @Get('stats')
  @ApiOperation({
    summary: 'Get SMS usage statistics',
    description: 'Retrieve statistics for SMS-based scam checks and reports',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStats(@Query() dto: SmsStatsQueryDto): Promise<any> {
    const stats = await this.httpSmsService.getStats(dto.days);
    return {
      success: true,
      data: stats,
      message: 'Statistics retrieved successfully',
    };
  }

  @Get('stats')
  @Public()
  @ApiOperation({
    summary: 'Check HTTP SMS service status',
    description: 'Get current status and configuration of the HTTP SMS service',
  })
  @ApiResponse({ status: 200, description: 'Service status retrieved' })
  async getStatus(): Promise<any> {
    const status = this.httpSmsService.getStats();
    return {
      success: true,
      data: status,
      message: 'Service status retrieved',
      timestamp: new Date().toISOString(),
    };
  }
}
