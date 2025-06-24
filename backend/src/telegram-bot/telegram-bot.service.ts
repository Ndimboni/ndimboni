import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Telegraf, Context } from 'telegraf';
import { TelegramConfig } from '../common/interfaces/config.interface';
import { RankingService } from '../scam-check/risk-score-ranking.service';
import { ScamCheckService } from 'src/scam-check/scam-check.service';
import { ScamReport } from 'src/entities/scam-report.entity';
import { ScamAnalysisFormatterService } from '../common/services/scam-analysis-formatter.service';

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
    private readonly rankingService: RankingService,
    private readonly scamCheckService: ScamCheckService,
    private readonly scamAnalysisFormatterService: ScamAnalysisFormatterService,
    @InjectRepository(ScamReport)
    private readonly scamReportRepository: Repository<ScamReport>,
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
🛡️ <b>Welcome to Ndimboni Digital Scam Protection Bot!</b>

I'm here to help you identify and report scams. Here's what I can do:

• <b>/report</b> [description] - Report a scam
• <b>/check</b> [message] - Check if a message might be a scam
• <b>/stats</b> - View scam statistics
• <b>/help</b> - Show this help message

Stay safe online! 🔒
    `;

    await ctx.reply(welcomeMessage, { parse_mode: 'HTML' });
  }

  private async handleHelpCommand(ctx: BotContext): Promise<void> {
    const helpMessage = `
📋 <b>Available Commands:</b>

<b>/start</b> - Welcome message and overview
<b>/help</b> - Show this help message
<b>/report</b> [description] - Report a scam you encountered
<b>/check</b> [message] - Analyze a message for scam indicators
<b>/stats</b> - View current scam statistics

<b>Examples:</b>
• <code>/report Received fake bank SMS asking for PIN</code>
• <code>/check Hey! You won $1000! Click here to claim...</code>

For support, contact our team.
    `;

    await ctx.reply(helpMessage, { parse_mode: 'HTML' });
  }

  private async handleReportCommand(ctx: BotContext): Promise<void> {
    const args =
      ctx.message && 'text' in ctx.message
        ? ctx.message.text.split(' ').slice(1).join(' ')
        : '';

    if (!args.trim()) {
      await ctx.reply(
        '❌ Please provide a description of the scam.\n\n' +
          'Example: <code>/report Received fake bank SMS asking for PIN</code>',
        { parse_mode: 'HTML' },
      );
      return;
    }

    try {
      // Send initial acknowledgment
      await ctx.reply('📝 Processing your scam report...', {
        parse_mode: 'HTML',
      });

      // Create the scammer report using simplified logic like WhatsApp
      const description = args.trim();

      // Use scamReportRepository directly like WhatsApp bot
      const report = this.scamReportRepository.create({
        title: 'Telegram Report',
        description,
        status: 'pending' as any, // Will be properly typed
        scamType: 'other' as any, // Will be properly typed
        reporterPhone: ctx.from?.id?.toString() || 'unknown',
        additionalInfo: JSON.stringify({
          reporterName: ctx.from?.first_name || 'Anonymous',
          telegramUserId: ctx.from?.id,
          telegramUsername: ctx.from?.username,
          chatId: ctx.chat?.id,
          chatType: ctx.chat?.type,
        }),
      } as Partial<ScamReport>);

      const saved = await this.scamReportRepository.save(report);

      // Use shared formatter for success message
      const successMessage =
        this.scamAnalysisFormatterService.formatReportSuccessResponse(
          saved.id,
          'telegram',
        );

      await ctx.reply(successMessage, { parse_mode: 'HTML' });

      this.logger.log(`Report submitted by user ${ctx.from?.id}: ${saved.id}`);
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
          'Example: <code>/check Hey, I got this message about winning money...</code>',
        { parse_mode: 'HTML' },
      );
      return;
    }

    // Send immediate feedback that analysis is starting
    const processingMessage = await ctx.reply(
      '🔍 **Analyzing message for scam indicators...**\n\n' +
        '⏳ This may take a few seconds while I check multiple databases and AI systems.\n\n' +
        '🛡️ Please wait for the complete analysis results.',
      { parse_mode: 'Markdown' },
    );

    try {
      // Use the scam check service directly like WhatsApp bot
      // Note: We don't pass checkedBy for Telegram users since they aren't registered users
      const result = await this.scamCheckService.checkMessage({
        message: args.trim(),
        source: 'telegram',
        // checkedBy is omitted - Telegram users aren't in our users table
      });

      // Delete the processing message safely
      try {
        if (ctx.chat && processingMessage?.message_id) {
          await ctx.telegram.deleteMessage(
            ctx.chat.id,
            processingMessage.message_id,
          );
        }
      } catch (deleteError) {
        this.logger.debug('Could not delete processing message:', deleteError);
        // This is non-critical, continue processing
      }

      // Format response using shared formatter service
      const response =
        this.scamAnalysisFormatterService.formatScamAnalysisResponse(
          args.trim(),
          result,
          'telegram',
        );

      // Send response with HTML parsing for better compatibility
      try {
        await ctx.reply(response, { parse_mode: 'HTML' });
      } catch (htmlError) {
        this.logger.warn(
          'HTML parsing failed, sending as plain text:',
          htmlError,
        );
        // Fallback to plain text if HTML fails
        const plainResponse = response.replace(/<[^>]*>/g, '');
        await ctx.reply(plainResponse);
      }

      this.logger.log(
        `Check command completed for user ${ctx.from?.id}: Risk=${Math.round(result.result.riskScore * 100)}%, Status=${result.result.riskLevel}`,
      );
    } catch (error) {
      // Delete the processing message if it exists
      try {
        if (ctx.chat && processingMessage?.message_id) {
          await ctx.telegram.deleteMessage(
            ctx.chat.id,
            processingMessage.message_id,
          );
        }
      } catch (deleteError) {
        this.logger.debug('Could not delete processing message:', deleteError);
        // This is non-critical, continue with error handling
      }

      this.logger.error('Error analyzing message:', error);
      await ctx.reply(
        '❌ **Analysis Failed**\n\n' +
          'Sorry, there was an error analyzing the message. This could be due to:\n' +
          '• Temporary network issues\n' +
          '• AI service overload\n' +
          '• Database connectivity\n\n' +
          '🔄 Please try again in a few moments.',
        { parse_mode: 'Markdown' },
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
          this.logger.debug(
            `Analyzing message in group ${ctx.chat.id} from user ${ctx.from?.id}`,
          );

          const analysis = await this.rankingService.analyzeMessage(
            ctx.message.text,
            ctx.from?.id?.toString(),
          );

          const action = this.rankingService.getModerationAction(analysis);
          const riskPercentage = Math.round(analysis.confidence * 100);

          if (action === 'delete') {
            await ctx.deleteMessage();

            const warningMessage = `
🚨 **Message Automatically Removed by Ndimboni Bot**

**Reason:** Potential scam content detected
**Risk Level:** ${analysis.riskLevel.toUpperCase()} (${riskPercentage}% confidence)
**Analysis Method:** ${analysis.analysisMethod || 'pattern-detection'}

${
  analysis.reasons.length > 0
    ? `**Detected Issues:**\n${analysis.reasons
        .slice(0, 3)
        .map((reason) => `• ${reason}`)
        .join('\n')}`
    : ''
}

🛡️ **Stay safe!** This action helps protect group members from scams.
            `;

            const warning = await ctx.reply(warningMessage, {
              parse_mode: 'Markdown',
            });

            // Auto-delete warning after 45 seconds
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
            }, 45000);

            this.logger.warn(
              `Deleted potential scam message in group ${ctx.chat.id} from user ${ctx.from?.id} - Risk: ${riskPercentage}%`,
            );
          } else if (action === 'warn') {
            const warningMessage = `
⚠️ **Caution: Potentially Suspicious Content**

**Risk Level:** ${analysis.riskLevel.toUpperCase()} (${riskPercentage}% confidence)

${
  analysis.reasons.length > 0
    ? `**Concerns:** ${analysis.reasons.slice(0, 2).join(', ')}`
    : ''
}

🔍 Please verify this content before taking any action.
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

            this.logger.log(
              `Warning issued for message in group ${ctx.chat.id} from user ${ctx.from?.id} - Risk: ${riskPercentage}%`,
            );
          }
        } catch (error) {
          this.logger.error('Error during auto-moderation:', error);
        }
      }
    } else {
      // For private chats, analyze all messages like WhatsApp bot
      if (ctx.message && 'text' in ctx.message) {
        const text = ctx.message.text.trim();

        // Respond to greetings like WhatsApp bot
        const greetings = ['hi', 'hello', 'hey', 'start', 'muraho', 'salut'];
        if (
          greetings.some((greeting) => text.toLowerCase().includes(greeting))
        ) {
          const capabilitiesMessage =
            this.scamAnalysisFormatterService.formatGreetingResponse(
              'telegram',
            );

          await ctx.reply(capabilitiesMessage, { parse_mode: 'HTML' });
          return;
        }

        // Skip analysis for commands (they have their own handlers)
        if (text.startsWith('/')) {
          return;
        }

        try {
          // Send processing message for analysis
          const processingMessage = await ctx.reply(
            '🔍 **Analyzing your message for scam indicators...**\n\n⏳ Please wait...',
            { parse_mode: 'Markdown' },
          );

          // Analyze the message using same logic as WhatsApp
          const result = await this.scamCheckService.checkMessage({
            message: text,
            source: 'telegram',
            // checkedBy is omitted - Telegram users aren't in our users table
          });

          // Delete processing message safely
          try {
            if (ctx.chat && processingMessage?.message_id) {
              await ctx.telegram.deleteMessage(
                ctx.chat.id,
                processingMessage.message_id,
              );
            }
          } catch (deleteError) {
            this.logger.debug(
              'Could not delete processing message:',
              deleteError,
            );
            // This is non-critical, continue processing
          }

          // Format and send response using shared formatter
          const response =
            this.scamAnalysisFormatterService.formatScamAnalysisResponse(
              text,
              result,
              'telegram',
            );

          // Send response with HTML parsing for better compatibility
          try {
            await ctx.reply(response, { parse_mode: 'HTML' });
          } catch (htmlError) {
            this.logger.warn(
              'HTML parsing failed in private chat, sending as plain text:',
              htmlError,
            );
            // Fallback to plain text if HTML fails
            const plainResponse = response.replace(/<[^>]*>/g, '');
            await ctx.reply(plainResponse);
          }

          this.logger.log(
            `Private message analyzed for user ${ctx.from?.id}: Risk=${Math.round(result.result.riskScore * 100)}%`,
          );
        } catch (error) {
          this.logger.error('Error analyzing private message:', error);
          await ctx.reply(
            "❌ **Analysis Error**\n\nSorry, I couldn't analyze your message right now. Please try again later or use the /check command.",
            { parse_mode: 'Markdown' },
          );
        }
      }
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
