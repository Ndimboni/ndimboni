import { Controller, Post, Get, Body, Req, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { WhatsappWebhookService } from './whatsapp-webhook.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('WhatsApp Bot')
@Controller('whatsapp/webhook')
export class WhatsappBotController {
  constructor(
    private readonly whatsappWebhookService: WhatsappWebhookService,
  ) {}

  @Get()
  @Public()
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const VERIFY_TOKEN =
      process.env.WHATSAPP_VERIFY_TOKEN || 'your-verify-token';
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Verification failed');
  }

  @Post()
  @ApiOperation({ summary: 'WhatsApp webhook endpoint for reporting scams' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @Public()
  async handleWebhook(
    @Body() update: any,
    @Req() req: any,
    @Res() res: Response,
  ) {
    // WhatsApp webhook payload is in update
    try {
      const result = await this.whatsappWebhookService.processUpdate(update);
      return res.status(200).json({ message: result });
    } catch (error) {
      return res
        .status(500)
        .json({ error: error.message || 'Internal server error' });
    }
  }
}
