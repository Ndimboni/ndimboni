import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EducationResource } from '../entities/education-resource.entity';
import {
  CreateEducationResourceDto,
  UpdateEducationResourceDto,
} from '../dto/education-resource.dto';

@Injectable()
export class EducationResourcesService {
  constructor(
    @InjectRepository(EducationResource)
    private readonly resourceRepo: Repository<EducationResource>,
  ) {}

  async create(dto: CreateEducationResourceDto): Promise<EducationResource> {
    const resource = this.resourceRepo.create(dto);
    return this.resourceRepo.save(resource);
  }

  async findAll(): Promise<EducationResource[]> {
    return this.resourceRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<EducationResource> {
    const resource = await this.resourceRepo.findOne({ where: { id } });
    if (!resource) throw new NotFoundException('Resource not found');
    return resource;
  }

  async update(
    id: string,
    dto: UpdateEducationResourceDto,
  ): Promise<EducationResource> {
    const resource = await this.findOne(id);
    Object.assign(resource, dto);
    return this.resourceRepo.save(resource);
  }

  async remove(id: string): Promise<void> {
    await this.resourceRepo.delete(id);
  }
}
