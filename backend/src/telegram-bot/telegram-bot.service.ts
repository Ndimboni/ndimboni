import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Context } from 'telegraf';
import { TelegramConfig } from '../common/interfaces/config.interface';
import { TelegramModerationService } from './telegram-moderation.service';
import { ScamCheckService } from 'src/scam-check/scam-check.service';
import { ScammerReportService } from 'src/scammer-reports/scammer-report.service';
import { ScammerType } from 'src/entities';

interface BotContext extends Context {
  botInfo: any;
}

@Injectable()
export class TelegramBotService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramBotService.name);
  private bot: Telegraf<BotContext>;
  private config: TelegramConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly moderationService: TelegramModerationService,
    private readonly scamCheckService: ScamCheckService,
    private readonly scamReportService: ScammerReportService, // Assuming this is the correct service for scam checks
  ) {
    const telegramConfig = this.configService.get<TelegramConfig>('telegram');
    if (!telegramConfig) {
      this.logger.warn('Telegram configuration not found. Bot will not start.');
      return;
    }
    this.config = telegramConfig;

    if (!this.config.botToken || this.config.botToken.trim() === '') {
      this.logger.warn(
        'Telegram bot token not configured or empty. Bot will not start.',
      );
      this.logger.warn(
        'To enable Telegram bot, set TELEGRAM_BOT_TOKEN in your .env file',
      );
      return;
    }

    // Validate bot token format (should be numbers:letters)
    const tokenPattern = /^\d+:[A-Za-z0-9_-]+$/;
    if (!tokenPattern.test(this.config.botToken)) {
      this.logger.warn(
        'Telegram bot token appears to be invalid format. Expected format: 123456789:ABCDEF...',
      );
      this.logger.warn('Bot will attempt to start anyway...');
    }

    this.bot = new Telegraf(this.config.botToken);
    this.setupBotHandlers();
  }

  async onModuleInit(): Promise<void> {
    if (!this.bot) return;

    // Start the bot in the background with timeout to prevent blocking app startup
    void this.startBotWithTimeout().catch((error) => {
      this.logger.error('Failed to start Telegram bot:', error);
    });
  }

  private async startBotWithTimeout(): Promise<void> {
    if (!this.bot) return;

    try {
      // First, validate the bot token by getting bot info
      this.logger.log('Validating Telegram bot token...');
      const botInfo = (await Promise.race([
        this.bot.telegram.getMe(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Bot validation timeout')), 5000),
        ),
      ])) as any;

      this.logger.log(
        `Bot token valid. Bot info: @${botInfo.username} (${botInfo.first_name})`,
      );

      // Add a timeout to prevent indefinite hanging during launch
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Bot launch timeout')), 10000); // 10 second timeout
      });

      this.logger.log('Starting Telegram bot...');
      // Check if webhook URL is configured
      if (this.config.webhookUrl) {
        this.logger.log(`Starting bot with webhook: ${this.config.webhookUrl}`);

        // Extract domain from full URL
        const webhookUrl = new URL(this.config.webhookUrl);
        const domain = webhookUrl.origin;
        const path = webhookUrl.pathname || '/telegram/webhook';

        await Promise.race([
          this.bot.launch({
            webhook: {
              domain: domain,
              port: parseInt(webhookUrl.port) || 443,
              hookPath: path,
            },
          }),
          timeoutPromise,
        ]);
      } else {
        this.logger.log('Starting bot with polling mode');
        await Promise.race([this.bot.launch(), timeoutPromise]);
      }
      this.logger.log('Telegram bot started successfully');
    } catch (error: any) {
      console.error(error);
      let errorMessage = error.message;

      // Provide more specific error messages
      if (error.message.includes('401')) {
        errorMessage = 'Invalid bot token (401 Unauthorized)';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Network timeout - check internet connection';
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'DNS resolution failed - check internet connection';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Connection refused - check firewall settings';
      }

      this.logger.warn('Telegram bot could not start (this is non-critical):');
      this.logger.warn(`Error: ${errorMessage}`);
      this.logger.warn(
        'The application will continue without Telegram bot functionality',
      );

      // Don't throw the error - let the application continue without the bot
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.bot) {
      this.bot.stop('SIGTERM');
      this.logger.log('Telegram bot stopped');
    }
  }

  private setupBotHandlers(): void {
    this.bot.start((ctx) => this.handleStartCommand(ctx));
    this.bot.help((ctx) => this.handleHelpCommand(ctx));
    this.bot.command('report', (ctx) => this.handleReportCommand(ctx));
    this.bot.command('check', (ctx) => this.handleCheckCommand(ctx));
    this.bot.command('stats', (ctx) => this.handleStatsCommand(ctx));

    // Handle text messages for auto-moderation
    this.bot.on('text', (ctx) => this.handleTextMessage(ctx));

    // Error handling
    this.bot.catch((err, ctx) => {
      this.logger.error('Bot error:', err);
      if (ctx) {
        void ctx.reply('Sorry, something went wrong. Please try again.');
      }
    });
  }

  private async handleStartCommand(ctx: BotContext): Promise<void> {
    const welcomeMessage = `
🛡️ **Welcome to Ndimboni Digital Scam Protection Bot!**

I'm here to help you identify and report scams. Here's what I can do:

• **/report** [description] - Report a scam
• **/check** [message] - Check if a message might be a scam
• **/stats** - View scam statistics
• **/help** - Show this help message

Stay safe online! 🔒
    `;

    await ctx.reply(welcomeMessage, { parse_mode: 'Markdown' });
  }

  private async handleHelpCommand(ctx: BotContext): Promise<void> {
    const helpMessage = `
📋 **Available Commands:**

**/start** - Welcome message and overview
**/help** - Show this help message
**/report** [description] - Report a scam you encountered
**/check** [message] - Analyze a message for scam indicators
**/stats** - View current scam statistics

**Examples:**
• \`/report Received fake bank SMS asking for PIN\`
• \`/check Hey! You won $1000! Click here to claim...\`

For support, contact our team.
    `;

    await ctx.reply(helpMessage, { parse_mode: 'Markdown' });
  }

  private async handleReportCommand(ctx: BotContext): Promise<void> {
    const args =
      ctx.message && 'text' in ctx.message
        ? ctx.message.text.split(' ').slice(1).join(' ')
        : '';

    if (!args.trim()) {
      await ctx.reply(
        '❌ Please provide a description of the scam.\n\n' +
          'Example: `/report Received fake bank SMS asking for PIN`',
        { parse_mode: 'Markdown' },
      );
      return;
    }

    try {
      // Send initial acknowledgment
      await ctx.reply('📝 Processing your scam report...', {
        parse_mode: 'Markdown',
      });

      // Create the scammer report using the correct service

      // Analyze the reported content to determine the scammer type
      let scammerType = ScammerType.OTHER;
      const content = args.trim().toLowerCase();

      // Check for phone number patterns
      const phonePatterns = [
        /\+?[\d\s\-\(\)]{10,}/g, // General phone pattern
        /\+250[\d\s\-]{9,}/g, // Rwanda specific
        /07\d{8}/g, // Rwanda mobile format
        /\b\d{3}[\s\-]?\d{3}[\s\-]?\d{4}\b/g, // US format
      ];

      // Check for email patterns
      const emailPattern =
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

      // Check for website/URL patterns
      const urlPatterns = [
        /https?:\/\/[^\s]+/g,
        /www\.[^\s]+/g,
        /\b[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*/g,
      ];

      // Determine scammer type based on content analysis
      if (phonePatterns.some((pattern) => pattern.test(content))) {
        scammerType = ScammerType.PHONE;
      } else if (emailPattern.test(content)) {
        scammerType = ScammerType.EMAIL;
      } else if (urlPatterns.some((pattern) => pattern.test(content))) {
        scammerType = ScammerType.WEBSITE;
      }

      // Extract the actual identifier from the content
      let identifier = 'unknown';
      if (scammerType === ScammerType.PHONE) {
        const phoneMatch = content.match(
          phonePatterns.find((p) => p.test(content)) || phonePatterns[0],
        );
        identifier = phoneMatch
          ? phoneMatch[0].replace(/\s+/g, '').trim()
          : 'unknown';
      } else if (scammerType === ScammerType.EMAIL) {
        const emailMatch = content.match(emailPattern);
        identifier = emailMatch ? emailMatch[0] : 'unknown';
      } else if (scammerType === ScammerType.WEBSITE) {
        const urlMatch = content.match(
          urlPatterns.find((p) => p.test(content)) || urlPatterns[0],
        );
        identifier = urlMatch ? urlMatch[0] : 'unknown';
      } else {
        // Fallback to using Telegram user ID for OTHER type
        identifier = ctx.from?.id?.toString() || 'unknown';
      }

      this.logger.log(
        `Detected scammer type: ${scammerType}, identifier: ${identifier}`,
      );
      const reportData = {
        type: scammerType,
        identifier: ctx.from?.id?.toString() || 'unknown',
        description: args.trim(),
        evidence: [],
        additionalInfo: JSON.stringify({
          reporterName: ctx.from?.first_name || 'Anonymous',
          contactInfo: `Telegram User ID: ${ctx.from?.id}`,
          telegramUserId: ctx.from?.id,
          telegramUsername: ctx.from?.username,
          chatId: ctx.chat?.id,
          chatType: ctx.chat?.type,
        }),
        // reportedBy: ctx.from?.first_name || 'Anonymous',
        source: 'telegram',
      };

      const report = await this.scamReportService.createReport(reportData);

      const successMessage = `
    ✅ **Report Submitted Successfully!**

    **Report ID:** ${report.id}
    **Status:** Under Review

    Thank you for helping protect others from scams. Our team will review your report and take appropriate action.

    🛡️ Stay vigilant and keep reporting suspicious activity!
      `;

      await ctx.reply(successMessage, { parse_mode: 'Markdown' });
    } catch (error) {
      this.logger.error('Error handling report command:', error);
      await ctx.reply(
        '❌ Sorry, there was an error submitting your report. Please try again later.',
      );
    }
  }

  private async handleCheckCommand(ctx: BotContext): Promise<void> {
    const args =
      ctx.message && 'text' in ctx.message
        ? ctx.message.text.split(' ').slice(1).join(' ')
        : '';

    if (!args.trim()) {
      await ctx.reply(
        '❌ Please provide a message to check.\n\n' +
          'Example: `/check Hey, I got this message about winning money...`',
        { parse_mode: 'Markdown' },
      );
      return;
    }

    try {
      // Use the moderation service for advanced analysis
      const analysis = await this.scamCheckService.checkMessage({
        message: args.trim(),
        source: 'telegram',
      });

      let response = `🔍 **Scam Analysis Results:**\n\n`;
      response += `**Message:** "${args.trim()}"\n\n`;

      if (analysis.riskScore >= 0.7) {
        response += `⚠️ **POTENTIAL SCAM DETECTED**\n\n`;
        response += `**Risk Score:** ${Math.round(analysis.riskScore * 100)}%\n`;
        response += `**Confidence:** ${Math.round(analysis.confidence * 100)}%\n\n`;

        if (analysis.reasons && analysis.reasons.length > 0) {
          response += `**Warning Signs:**\n`;
          analysis.reasons.forEach((reason) => {
            response += `• ${reason}\n`;
          });
          response += `\n`;
        }

        response += `**Recommendation:** Be extremely cautious with this message.`;
      } else if (analysis.riskScore >= 0.4) {
        response += `⚠️ **MODERATE RISK DETECTED**\n\n`;
        response += `**Risk Score:** ${Math.round(analysis.riskScore * 100)}%\n`;
        response += `**Confidence:** ${Math.round(analysis.confidence * 100)}%\n\n`;

        response += `**Recommendation:** Exercise caution and verify the source.`;
      } else {
        response += `✅ **LOW RISK**\n\n`;
        response += `**Risk Score:** ${Math.round(analysis.riskScore * 100)}%\n`;
        response += `**Recommendation:** Message appears relatively safe.`;
      }

      await ctx.reply(response, { parse_mode: 'Markdown' });
    } catch (error) {
      this.logger.error('Error analyzing message:', error);
      await ctx.reply(
        '❌ Sorry, there was an error analyzing the message. Please try again later.',
      );
    }
  }

  private async handleStatsCommand(ctx: BotContext): Promise<void> {
    try {
      await ctx.reply(
        `📊 **Scam Statistics:**\n\n` +
          `ℹ️ For detailed statistics, please use our web platform or API endpoints.\n\n` +
          `For more information, visit our help documentation.`,
        { parse_mode: 'Markdown' },
      );
    } catch (error) {
      this.logger.error('Error handling stats command:', error);
      await ctx.reply(
        '❌ Sorry, there was an error processing your request. Please try again later.',
      );
    }
  }

  private async handleTextMessage(ctx: BotContext): Promise<void> {
    // Auto-moderation for group messages
    if (ctx.chat?.type === 'group' || ctx.chat?.type === 'supergroup') {
      if (ctx.message && 'text' in ctx.message) {
        try {
          const analysis = await this.moderationService.analyzeMessage(
            ctx.message.text,
            ctx.from?.id?.toString(),
          );

          const action = this.moderationService.getModerationAction(analysis);

          if (action === 'delete') {
            await ctx.deleteMessage();

            const warningMessage = `
⚠️ **Message removed by Ndimboni Bot**

A message was automatically removed because it contained potential scam content.

**Risk Level:** ${analysis.riskLevel.toUpperCase()}
**Confidence:** ${Math.round(analysis.confidence * 100)}%

Stay safe! 🛡️
            `;

            const warning = await ctx.reply(warningMessage, {
              parse_mode: 'Markdown',
            });

            // Auto-delete warning after 30 seconds
            setTimeout(() => {
              void (async () => {
                try {
                  if (ctx.chat) {
                    await ctx.telegram.deleteMessage(
                      ctx.chat.id,
                      warning.message_id,
                    );
                  }
                } catch (error) {
                  this.logger.debug('Could not delete warning message:', error);
                }
              })();
            }, 30000);

            this.logger.warn(
              `Deleted potential scam message in group ${ctx.chat.id} from user ${ctx.from?.id}`,
            );
          } else if (action === 'warn') {
            const warningMessage = `
⚠️ **Caution advised**

This message contains potentially suspicious content.

**Risk Level:** ${analysis.riskLevel.toUpperCase()}
            `;

            const warning = await ctx.reply(warningMessage, {
              parse_mode: 'Markdown',
              reply_parameters: {
                message_id: ctx.message.message_id,
              },
            });

            // Auto-delete warning after 60 seconds
            setTimeout(() => {
              void (async () => {
                try {
                  if (ctx.chat) {
                    await ctx.telegram.deleteMessage(
                      ctx.chat.id,
                      warning.message_id,
                    );
                  }
                } catch (error) {
                  this.logger.debug('Could not delete warning message:', error);
                }
              })();
            }, 60000);
          }
        } catch (error) {
          this.logger.error('Error during auto-moderation:', error);
        }
      }
    } else {
      // For private chats, always reply with bot capabilities after any message
      const capabilitiesMessage = `\n🤖 *Ndimboni Digital Scam Protection Bot Capabilities*\n\nYou can:\n• /report [description] — Report a scammer or scam incident\n• /check [message] — Check if a message might be a scam\n• /start — View welcome message and overview\n\nJust type your command or message!`;
      await ctx.reply(capabilitiesMessage, { parse_mode: 'Markdown' });
    }
  }

  getBotInstance(): Telegraf<BotContext> | undefined {
    return this.bot;
  }

  async testBotConnectivity(): Promise<{
    isConfigured: boolean;
    isConnected: boolean;
    botInfo?: any;
    error?: string;
  }> {
    const result: {
      isConfigured: boolean;
      isConnected: boolean;
      botInfo?: any;
      error?: string;
    } = {
      isConfigured: !!this.bot,
      isConnected: false,
    };

    if (!this.bot) {
      result.error = 'Bot not configured - missing token or configuration';
      return result;
    }

    try {
      this.logger.log('Testing Telegram bot connectivity...');
      const botInfo = await this.bot.telegram.getMe();
      result.isConnected = true;
      result.botInfo = {
        id: botInfo.id,
        username: botInfo.username,
        firstName: botInfo.first_name,
        canJoinGroups: botInfo.can_join_groups,
        canReadAllGroupMessages: botInfo.can_read_all_group_messages,
        supportsInlineQueries: botInfo.supports_inline_queries,
      };
      this.logger.log(`Bot connectivity test successful: @${botInfo.username}`);
    } catch (error: any) {
      result.error = error.message;
      this.logger.warn(`Bot connectivity test failed: ${error.message}`);
    }

    return result;
  }
}
