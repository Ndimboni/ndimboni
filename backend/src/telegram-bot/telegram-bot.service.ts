import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Context } from 'telegraf';
import { TelegramConfig } from '../common/interfaces/config.interface';
import { ScamReportsService } from '../scam-reports/scam-reports.service';
import { ScamType } from '../entities/scam-report.entity';
import { TelegramModerationService } from './telegram-moderation.service';

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
    private readonly scamReportsService: ScamReportsService,
    private readonly moderationService: TelegramModerationService,
  ) {
    const telegramConfig = this.configService.get<TelegramConfig>('telegram');
    if (!telegramConfig) {
      this.logger.warn(
        'Telegram bot token not configured. Bot will not start.',
      );
      return;
    }
    this.config = telegramConfig;

    if (!this.config.botToken) {
      this.logger.warn(
        'Telegram bot token not configured. Bot will not start.',
      );
      return;
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
      // Add a timeout to prevent indefinite hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Bot launch timeout')), 10000); // 10 second timeout
      });

      await Promise.race([this.bot.launch(), timeoutPromise]);
      this.logger.log('Telegram bot started successfully');

      const botInfo = await this.bot.telegram.getMe();
      this.logger.log(`Bot running as @${botInfo.username}`);
    } catch (error) {
      this.logger.warn(
        'Telegram bot could not start (this is non-critical):',
        error.message,
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
      // Create scam report
      const report = await this.scamReportsService.create({
        title: 'Telegram Bot Report',
        description: args.trim(),
        scamType: ScamType.OTHER,
        reporterEmail: `telegram_${ctx.from?.id || 'anonymous'}@ndimboni.bot`,
      });

      await ctx.reply(
        `✅ Thank you for reporting this scam! Your report has been recorded with ID: ${report.id}`,
        { parse_mode: 'Markdown' },
      );
    } catch (error) {
      this.logger.error('Error creating scam report:', error);
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
      const analysis = await this.moderationService.analyzeMessage(
        args.trim(),
        ctx.from?.id?.toString(),
      );

      let response = `🔍 **Scam Analysis Results:**\n\n`;
      response += `**Message:** "${args.trim()}"\n\n`;

      if (analysis.isScam) {
        response += `⚠️ **POTENTIAL SCAM DETECTED**\n\n`;
        response += `**Risk Level:** ${analysis.riskLevel.toUpperCase()}\n`;
        response += `**Confidence:** ${Math.round(analysis.confidence * 100)}%\n\n`;

        if (analysis.reasons.length > 0) {
          response += `**Warning Signs:**\n`;
          analysis.reasons.forEach((reason) => {
            response += `• ${reason}\n`;
          });
          response += `\n`;
        }

        response += `**Recommendation:** Be extremely cautious with this message.`;
      } else if (analysis.riskLevel === 'medium') {
        response += `⚠️ **MODERATE RISK DETECTED**\n\n`;
        response += `**Risk Level:** ${analysis.riskLevel.toUpperCase()}\n`;
        response += `**Confidence:** ${Math.round(analysis.confidence * 100)}%\n\n`;

        response += `**Recommendation:** Exercise caution and verify the source.`;
      } else {
        response += `✅ **LOW RISK**\n\n`;
        response += `**Risk Level:** ${analysis.riskLevel.toUpperCase()}\n`;
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
      const stats = await this.scamReportsService.getStats();
      const message = `
📊 **Scam Statistics:**

📈 **Total Reports:** ${stats.total}
📋 **Pending:** ${stats.pending}
✅ **Verified:** ${stats.verified}
❌ **Rejected:** ${stats.rejected}
🔍 **Investigating:** ${stats.investigating}

**By Type:**
📧 **Email:** ${stats.byType[ScamType.EMAIL] || 0}
📱 **SMS:** ${stats.byType[ScamType.SMS] || 0}
📞 **Phone Call:** ${stats.byType[ScamType.PHONE_CALL] || 0}
🌐 **Social Media:** ${stats.byType[ScamType.SOCIAL_MEDIA] || 0}
💻 **Website:** ${stats.byType[ScamType.WEBSITE] || 0}
❓ **Other:** ${stats.byType[ScamType.OTHER] || 0}

🔒 Together, we're making the digital world safer!
      `;

      await ctx.reply(message, { parse_mode: 'Markdown' });
    } catch (error) {
      this.logger.error('Error fetching statistics:', error);
      await ctx.reply('❌ Sorry, unable to fetch statistics at the moment.');
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
            setTimeout(async () => {
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
            setTimeout(async () => {
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
            }, 60000);
          }
        } catch (error) {
          this.logger.error('Error during auto-moderation:', error);
        }
      }
    }
  }

  getBotInstance(): Telegraf<BotContext> | undefined {
    return this.bot;
  }
}
