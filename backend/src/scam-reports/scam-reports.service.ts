import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ScamReport,
  ScamType,
  ScamStatus,
} from '../entities/scam-report.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../common/interfaces/user.interface';

export interface CreateScamReportDto {
  title: string;
  description: string;
  scamType: ScamType;
  scammerInfo?: string;
  evidenceUrl?: string;
  reporterEmail?: string;
  reporterPhone?: string;
}

export interface UpdateScamReportDto {
  title?: string;
  description?: string;
  scamType?: ScamType;
  status?: ScamStatus;
  scammerInfo?: string;
  evidenceUrl?: string;
}

@Injectable()
export class ScamReportsService {
  constructor(
    @InjectRepository(ScamReport)
    private readonly scamReportRepository: Repository<ScamReport>,
  ) {}

  async findAll(): Promise<ScamReport[]> {
    return this.scamReportRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<ScamReport> {
    const report = await this.scamReportRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!report) {
      throw new NotFoundException('Scam report not found');
    }

    return report;
  }

  async findByUser(userId: string): Promise<ScamReport[]> {
    return this.scamReportRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(
    createDto: CreateScamReportDto,
    user?: User,
  ): Promise<ScamReport> {
    const scamReport = this.scamReportRepository.create({
      ...createDto,
      userId: user?.id,
      status: ScamStatus.PENDING,
    });

    return this.scamReportRepository.save(scamReport);
  }

  async update(
    id: string,
    updateDto: UpdateScamReportDto,
    user: User,
  ): Promise<ScamReport> {
    const report = await this.findById(id);

    // Check permissions - only admin/moderator or report owner can update
    if (
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.MODERATOR &&
      report.userId !== user.id
    ) {
      throw new ForbiddenException('You can only update your own reports');
    }

    // Regular users can't change status
    if (
      user.role === UserRole.USER &&
      updateDto.status &&
      updateDto.status !== report.status
    ) {
      delete updateDto.status;
    }

    await this.scamReportRepository.update(id, updateDto);
    return this.findById(id);
  }

  async delete(id: string, user: User): Promise<void> {
    const report = await this.findById(id);

    // Check permissions - only admin or report owner can delete
    if (user.role !== UserRole.ADMIN && report.userId !== user.id) {
      throw new ForbiddenException('You can only delete your own reports');
    }

    await this.scamReportRepository.delete(id);
  }

  async getStats(): Promise<{
    total: number;
    pending: number;
    verified: number;
    rejected: number;
    investigating: number;
    byType: Record<ScamType, number>;
  }> {
    const [total, pending, verified, rejected, investigating] =
      await Promise.all([
        this.scamReportRepository.count(),
        this.scamReportRepository.count({
          where: { status: ScamStatus.PENDING },
        }),
        this.scamReportRepository.count({
          where: { status: ScamStatus.VERIFIED },
        }),
        this.scamReportRepository.count({
          where: { status: ScamStatus.REJECTED },
        }),
        this.scamReportRepository.count({
          where: { status: ScamStatus.INVESTIGATING },
        }),
      ]);

    // Get counts by type
    const typeStats = await this.scamReportRepository
      .createQueryBuilder('report')
      .select('report.scamType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('report.scamType')
      .getRawMany();

    const byType = Object.values(ScamType).reduce(
      (acc, type) => {
        acc[type] = 0;
        return acc;
      },
      {} as Record<ScamType, number>,
    );

    typeStats.forEach(({ type, count }) => {
      byType[type] = parseInt(count);
    });

    return {
      total,
      pending,
      verified,
      rejected,
      investigating,
      byType,
    };
  }
}
