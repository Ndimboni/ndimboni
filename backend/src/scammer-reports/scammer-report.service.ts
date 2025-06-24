import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import {
  ScammerReport,
  ScammerType,
  ScammerStatus,
} from '../entities/scammer-report.entity';
import { ScammerReportInstance } from '../entities/scammer-report-instance.entity';
import { AutoVerificationService } from '../common/services/auto-verification.service';

export interface CreateScammerReportRequest {
  type: ScammerType;
  identifier: string;
  description: string;
  additionalInfo?: string;
  reportedBy?: string;
  ipAddress?: string;
  source?: string; // Source of the report (web, telegram, api, etc.)
}

export interface UpdateScammerReportRequest {
  status?: ScammerStatus;
  additionalInfo?: string;
  verifiedBy?: string;
}

export interface ScammerReportResponse {
  id: string;
  type: ScammerType;
  identifier: string;
  description: string;
  evidence: string[];
  status: ScammerStatus;
  reportedBy?: string;
  verifiedBy?: string;
  additionalInfo?: string;
  reportCount: number;
  lastReportedAt?: Date;
  source: string;
  isAutoVerified: boolean;
  autoVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScammerReportStats {
  totalReports: number;
  pendingReports: number;
  verifiedReports: number;
  falsePositiveReports: number;
  investigatingReports: number;
  reportsByType: { type: ScammerType; count: number }[];
  recentReports: ScammerReportResponse[];
  topScammers: ScammerReportResponse[];
}

export interface SearchScammerRequest {
  query?: string;
  type?: ScammerType;
  status?: ScammerStatus;
  limit?: number;
  offset?: number;
}

@Injectable()
export class ScammerReportService {
  private readonly logger = new Logger(ScammerReportService.name);

  constructor(
    @InjectRepository(ScammerReport)
    private readonly scammerReportRepository: Repository<ScammerReport>,
    @InjectRepository(ScammerReportInstance)
    private readonly reportInstanceRepository: Repository<ScammerReportInstance>,
    private readonly autoVerificationService: AutoVerificationService,
  ) {}

  async createReport(
    request: CreateScammerReportRequest,
  ): Promise<ScammerReportResponse> {
    try {
      this.logger.log(
        `Creating scammer report for ${request.type}: ${request.identifier}`,
      );

      // Check if this scammer already exists
      const existingReport = await this.scammerReportRepository.findOne({
        where: {
          type: request.type,
          identifier: request.identifier.toLowerCase(),
        },
        relations: ['reportInstances'],
      });

      let scammerReport: ScammerReport;

      if (existingReport) {
        // Check if this user has already reported this scammer (prevent duplicate reports)
        if (request.reportedBy) {
          const existingUserReport =
            await this.reportInstanceRepository.findOne({
              where: {
                scammerReportId: existingReport.id,
                reportedBy: request.reportedBy,
              },
            });

          if (existingUserReport) {
            this.logger.warn(
              `User ${request.reportedBy} has already reported scammer ${existingReport.id}`,
            );
            // Return existing report without creating duplicate
            return this.mapToResponse(existingReport);
          }
        }

        // Update existing report
        existingReport.reportCount += 1;
        existingReport.lastReportedAt = new Date();
        existingReport.description = request.description; // Update with latest description

        if (request.additionalInfo) {
          const existingInfo = existingReport.additionalInfo || '';
          existingReport.additionalInfo =
            existingInfo + '\n\n' + request.additionalInfo;
        }

        scammerReport = await this.scammerReportRepository.save(existingReport);
      } else {
        // Create new report
        const newReport = new ScammerReport();
        newReport.type = request.type;
        newReport.identifier = request.identifier.toLowerCase();
        newReport.description = request.description;
        newReport.additionalInfo = request.additionalInfo || null;
        newReport.reportedBy = request.reportedBy || null;
        newReport.ipAddress = request.ipAddress || null;
        newReport.source = request.source || 'web';
        newReport.lastReportedAt = new Date();

        scammerReport = await this.scammerReportRepository.save(newReport);
      }

      // Create report instance for this specific report
      const reportInstance = new ScammerReportInstance();
      reportInstance.scammerReportId = scammerReport.id;
      reportInstance.reportedBy = request.reportedBy || null;
      reportInstance.ipAddress = request.ipAddress || null;
      reportInstance.description = request.description;
      reportInstance.additionalInfo = request.additionalInfo || null;
      reportInstance.source = request.source || 'web';

      await this.reportInstanceRepository.save(reportInstance);

      // Check for auto-verification after creating the report instance
      if (scammerReport.status === ScammerStatus.PENDING) {
        const wasAutoVerified =
          await this.autoVerificationService.autoVerifyReport(scammerReport.id);

        if (wasAutoVerified) {
          // Refresh the report to get updated status
          const updatedReport = await this.scammerReportRepository.findOne({
            where: { id: scammerReport.id },
          });
          if (updatedReport) {
            scammerReport = updatedReport;
          }
        }
      }

      this.logger.log(
        `${existingReport ? 'Updated existing' : 'Created new'} scammer report: ${scammerReport.id}`,
      );
      return this.mapToResponse(scammerReport);
    } catch (error) {
      this.logger.error('Error creating scammer report:', error);
      throw error;
    }
  }

  async updateReport(
    id: string,
    request: UpdateScammerReportRequest,
  ): Promise<ScammerReportResponse | null> {
    const report = await this.scammerReportRepository.findOne({
      where: { id },
    });

    if (!report) {
      return null;
    }

    if (request.status !== undefined) {
      report.status = request.status;
    }

    if (request.additionalInfo !== undefined) {
      report.additionalInfo = request.additionalInfo;
    }

    if (request.verifiedBy !== undefined) {
      report.verifiedBy = request.verifiedBy;
    }

    const updatedReport = await this.scammerReportRepository.save(report);
    this.logger.log(`Updated scammer report: ${updatedReport.id}`);

    return this.mapToResponse(updatedReport);
  }

  async getReportById(id: string): Promise<ScammerReportResponse | null> {
    const report = await this.scammerReportRepository.findOne({
      where: { id },
      relations: ['reporter', 'verifier'],
    });

    return report ? this.mapToResponse(report) : null;
  }

  async searchReports(
    request: SearchScammerRequest,
  ): Promise<ScammerReportResponse[]> {
    const queryBuilder =
      this.scammerReportRepository.createQueryBuilder('report');

    if (request.query) {
      queryBuilder.where(
        '(report.identifier ILIKE :query OR report.description ILIKE :query)',
        { query: `%${request.query}%` },
      );
    }

    if (request.type) {
      queryBuilder.andWhere('report.type = :type', { type: request.type });
    }

    if (request.status) {
      queryBuilder.andWhere('report.status = :status', {
        status: request.status,
      });
    }

    queryBuilder
      .orderBy('report.createdAt', 'DESC')
      .take(request.limit || 50)
      .skip(request.offset || 0);

    const reports = await queryBuilder.getMany();
    return reports.map((report) => this.mapToResponse(report));
  }

  async checkScammer(
    type: ScammerType,
    identifier: string,
  ): Promise<ScammerReportResponse | null> {
    const report = await this.scammerReportRepository.findOne({
      where: {
        type,
        identifier: identifier.toLowerCase(),
        status: ScammerStatus.VERIFIED,
      },
    });

    return report ? this.mapToResponse(report) : null;
  }

  async getReportsByUser(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<ScammerReportResponse[]> {
    const reports = await this.scammerReportRepository.find({
      where: { reportedBy: userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['reporter', 'verifier'],
    });

    return reports.map((report) => this.mapToResponse(report));
  }

  async getPendingReports(limit = 50): Promise<ScammerReportResponse[]> {
    const reports = await this.scammerReportRepository.find({
      where: { status: ScammerStatus.PENDING },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['reporter', 'verifier'],
    });

    return reports.map((report) => this.mapToResponse(report));
  }

  async getStats(days = 30): Promise<ScammerReportStats> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const reports = await this.scammerReportRepository.find({
      where: {
        createdAt: MoreThanOrEqual(startDate),
      },
      order: { createdAt: 'DESC' },
    });

    const stats: ScammerReportStats = {
      totalReports: reports.length,
      pendingReports: 0,
      verifiedReports: 0,
      falsePositiveReports: 0,
      investigatingReports: 0,
      reportsByType: [],
      recentReports: [],
      topScammers: [],
    };

    // Count by status
    const statusCounts = {
      [ScammerStatus.PENDING]: 0,
      [ScammerStatus.VERIFIED]: 0,
      [ScammerStatus.FALSE_POSITIVE]: 0,
      [ScammerStatus.INVESTIGATING]: 0,
    };

    // Count by type
    const typeCounts: { [key in ScammerType]?: number } = {};

    reports.forEach((report) => {
      statusCounts[report.status]++;

      typeCounts[report.type] = (typeCounts[report.type] || 0) + 1;
    });

    stats.pendingReports = statusCounts[ScammerStatus.PENDING];
    stats.verifiedReports = statusCounts[ScammerStatus.VERIFIED];
    stats.falsePositiveReports = statusCounts[ScammerStatus.FALSE_POSITIVE];
    stats.investigatingReports = statusCounts[ScammerStatus.INVESTIGATING];

    // Reports by type
    stats.reportsByType = Object.entries(typeCounts)
      .map(([type, count]) => ({ type: type as ScammerType, count }))
      .sort((a, b) => b.count - a.count);

    // Recent reports (last 10)
    stats.recentReports = reports
      .slice(0, 10)
      .map((report) => this.mapToResponse(report));

    // Top scammers (most reported)
    const topScammers = await this.scammerReportRepository.find({
      order: { reportCount: 'DESC' },
      take: 10,
    });

    stats.topScammers = topScammers.map((report) => this.mapToResponse(report));

    return stats;
  }

  async getAllReports(
    limit = 100,
    offset = 0,
    status?: ScammerStatus,
    type?: ScammerType,
    fromDate?: Date,
    toDate?: Date,
    query?: string,
  ): Promise<{
    data: ScammerReportResponse[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const queryBuilder = this.scammerReportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.reporter', 'reporter')
      .leftJoinAndSelect('report.verifier', 'verifier');

    // Apply filters
    if (status) {
      queryBuilder.andWhere('report.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('report.type = :type', { type });
    }

    if (fromDate) {
      queryBuilder.andWhere('report.createdAt >= :fromDate', { fromDate });
    }

    if (toDate) {
      queryBuilder.andWhere('report.createdAt <= :toDate', { toDate });
    }

    if (query) {
      queryBuilder.andWhere(
        '(report.identifier ILIKE :query OR report.description ILIKE :query)',
        { query: `%${query}%` },
      );
    }

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination and ordering
    const reports = await queryBuilder
      .orderBy('report.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();

    return {
      data: reports.map((report) => this.mapToResponse(report)),
      total,
      limit,
      offset,
    };
  }

  async deleteReport(id: string): Promise<boolean> {
    const result = await this.scammerReportRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  private mapToResponse(report: ScammerReport): ScammerReportResponse {
    return {
      id: report.id,
      type: report.type,
      identifier: report.identifier,
      description: report.description,
      evidence: report.evidence ? JSON.parse(report.evidence) : [],
      status: report.status,
      reportedBy: report.reportedBy ?? undefined,
      verifiedBy: report.verifiedBy ?? undefined,
      additionalInfo: report.additionalInfo ?? undefined,
      reportCount: report.reportCount,
      lastReportedAt: report.lastReportedAt ?? undefined,
      source: report.source,
      isAutoVerified: report.isAutoVerified,
      autoVerifiedAt: report.autoVerifiedAt ?? undefined,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    };
  }
}
