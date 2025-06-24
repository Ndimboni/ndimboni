import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  ScammerReport,
  ScammerType,
  ScammerStatus,
} from '../../entities/scammer-report.entity';
import { ScammerReportInstance } from '../../entities/scammer-report-instance.entity';
import { AutoVerificationConfig } from '../interfaces/config.interface';

export interface AutoVerificationResult {
  shouldVerify: boolean;
  threshold: number;
  currentCount: number;
  uniqueReportersCount?: number;
  reason: string;
}

@Injectable()
export class AutoVerificationService {
  private readonly logger = new Logger(AutoVerificationService.name);
  private readonly autoVerificationConfig: AutoVerificationConfig;

  constructor(
    @InjectRepository(ScammerReport)
    private readonly scammerReportRepository: Repository<ScammerReport>,
    @InjectRepository(ScammerReportInstance)
    private readonly reportInstanceRepository: Repository<ScammerReportInstance>,
    private readonly configService: ConfigService,
  ) {
    this.autoVerificationConfig =
      this.configService.get<AutoVerificationConfig>('autoVerification') || {
        enabled: false,
        phoneThreshold: 5,
        emailThreshold: 3,
        socialMediaThreshold: 4,
        websiteThreshold: 3,
        otherThreshold: 5,
        uniqueReportersRequired: true,
      };
  }

  async checkAutoVerification(
    scammerReportId: string,
  ): Promise<AutoVerificationResult> {
    if (!this.autoVerificationConfig.enabled) {
      return {
        shouldVerify: false,
        threshold: 0,
        currentCount: 0,
        reason: 'Auto-verification is disabled',
      };
    }

    const scammerReport = await this.scammerReportRepository.findOne({
      where: { id: scammerReportId },
      relations: ['reportInstances'],
    });

    if (!scammerReport) {
      return {
        shouldVerify: false,
        threshold: 0,
        currentCount: 0,
        reason: 'Scammer report not found',
      };
    }

    if (scammerReport.status === ScammerStatus.VERIFIED) {
      return {
        shouldVerify: false,
        threshold: this.getThresholdForType(scammerReport.type),
        currentCount: scammerReport.reportCount,
        reason: 'Already verified',
      };
    }

    const threshold = this.getThresholdForType(scammerReport.type);
    let reportInstances = scammerReport.reportInstances || [];

    if (this.autoVerificationConfig.timePeriodHours) {
      const cutoffDate = new Date();
      cutoffDate.setHours(
        cutoffDate.getHours() - this.autoVerificationConfig.timePeriodHours,
      );

      reportInstances = reportInstances.filter(
        (instance) => instance.createdAt >= cutoffDate,
      );
    }

    const currentCount = reportInstances.length;
    let uniqueReportersCount: number | undefined;

    if (this.autoVerificationConfig.uniqueReportersRequired) {
      const uniqueReporters = new Set(
        reportInstances
          .filter((instance) => instance.reportedBy)
          .map((instance) => instance.reportedBy),
      );
      uniqueReportersCount = uniqueReporters.size;

      if (uniqueReportersCount < threshold) {
        return {
          shouldVerify: false,
          threshold,
          currentCount,
          uniqueReportersCount,
          reason: `Not enough unique reporters (${uniqueReportersCount}/${threshold})`,
        };
      }
    } else {
      if (currentCount < threshold) {
        return {
          shouldVerify: false,
          threshold,
          currentCount,
          reason: `Not enough reports (${currentCount}/${threshold})`,
        };
      }
    }

    return {
      shouldVerify: true,
      threshold,
      currentCount,
      uniqueReportersCount,
      reason: 'Threshold met for auto-verification',
    };
  }

  async autoVerifyReport(scammerReportId: string): Promise<boolean> {
    try {
      const verificationResult =
        await this.checkAutoVerification(scammerReportId);

      if (!verificationResult.shouldVerify) {
        this.logger.debug(
          `Skipping auto-verification for ${scammerReportId}: ${verificationResult.reason}`,
        );
        return false;
      }

      const result = await this.scammerReportRepository.update(
        scammerReportId,
        {
          status: ScammerStatus.VERIFIED,
          isAutoVerified: true,
          autoVerifiedAt: new Date(),
          verifiedBy: 'system',
        },
      );

      if (result.affected && result.affected > 0) {
        this.logger.log(
          `Auto-verified scammer report ${scammerReportId} - ` +
            `${verificationResult.currentCount} reports, ` +
            `${verificationResult.uniqueReportersCount || 'N/A'} unique reporters`,
        );
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(
        `Error auto-verifying report ${scammerReportId}:`,
        error,
      );
      return false;
    }
  }

  async processAutoVerification(): Promise<void> {
    if (!this.autoVerificationConfig.enabled) {
      return;
    }

    try {
      this.logger.log('Starting auto-verification process...');

      const pendingReports = await this.scammerReportRepository.find({
        where: {
          status: ScammerStatus.PENDING,
          isAutoVerified: false,
        },
        relations: ['reportInstances'],
      });

      let verifiedCount = 0;

      for (const report of pendingReports) {
        const wasVerified = await this.autoVerifyReport(report.id);
        if (wasVerified) {
          verifiedCount++;
        }
      }

      this.logger.log(
        `Auto-verification process completed. Verified ${verifiedCount} out of ${pendingReports.length} pending reports.`,
      );
    } catch (error) {
      this.logger.error('Error in auto-verification process:', error);
    }
  }

  private getThresholdForType(type: ScammerType): number {
    switch (type) {
      case ScammerType.PHONE:
        return this.autoVerificationConfig.phoneThreshold;
      case ScammerType.EMAIL:
        return this.autoVerificationConfig.emailThreshold;
      case ScammerType.SOCIAL_MEDIA:
        return this.autoVerificationConfig.socialMediaThreshold;
      case ScammerType.WEBSITE:
        return this.autoVerificationConfig.websiteThreshold;
      case ScammerType.OTHER:
      default:
        return this.autoVerificationConfig.otherThreshold;
    }
  }

  async getAutoVerificationStats(): Promise<{
    enabled: boolean;
    thresholds: Record<ScammerType, number>;
    autoVerifiedCount: number;
    pendingReports: number;
    uniqueReportersRequired: boolean;
    timePeriodHours?: number;
  }> {
    const autoVerifiedCount = await this.scammerReportRepository.count({
      where: { isAutoVerified: true },
    });

    const pendingReports = await this.scammerReportRepository.count({
      where: { status: ScammerStatus.PENDING },
    });

    return {
      enabled: this.autoVerificationConfig.enabled,
      thresholds: {
        [ScammerType.PHONE]: this.autoVerificationConfig.phoneThreshold,
        [ScammerType.EMAIL]: this.autoVerificationConfig.emailThreshold,
        [ScammerType.SOCIAL_MEDIA]:
          this.autoVerificationConfig.socialMediaThreshold,
        [ScammerType.WEBSITE]: this.autoVerificationConfig.websiteThreshold,
        [ScammerType.OTHER]: this.autoVerificationConfig.otherThreshold,
      },
      autoVerifiedCount,
      pendingReports,
      uniqueReportersRequired:
        this.autoVerificationConfig.uniqueReportersRequired,
      timePeriodHours: this.autoVerificationConfig.timePeriodHours,
    };
  }
}
