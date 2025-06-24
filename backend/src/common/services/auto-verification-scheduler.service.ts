import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AutoVerificationService } from './auto-verification.service';

@Injectable()
export class AutoVerificationSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(AutoVerificationSchedulerService.name);
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    private readonly autoVerificationService: AutoVerificationService,
  ) {}

  onModuleInit() {
    // Start the auto-verification process every 30 minutes (1800000 ms)
    this.startAutoVerificationInterval();
  }

  private startAutoVerificationInterval() {
    this.logger.log('Starting auto-verification scheduler (every 30 minutes)');

    this.intervalId = setInterval(
      () => {
        this.runAutoVerificationProcess().catch((error) => {
          this.logger.error('Error in interval auto-verification:', error);
        });
      },
      30 * 60 * 1000,
    ); // 30 minutes
  }

  async runAutoVerificationProcess() {
    this.logger.log('Running scheduled auto-verification process...');
    try {
      await this.autoVerificationService.processAutoVerification();
      this.logger.log(
        'Scheduled auto-verification process completed successfully',
      );
    } catch (error) {
      this.logger.error('Error in scheduled auto-verification process:', error);
    }
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.logger.log('Auto-verification scheduler stopped');
    }
  }

  /**
   * Manually trigger the auto-verification process
   */
  async triggerManualVerification(): Promise<void> {
    this.logger.log('Manually triggering auto-verification process...');
    await this.runAutoVerificationProcess();
  }
}
