import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EducationResource,
  ResourceStatus,
} from '../entities/education-resource.entity';
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

  async create(dto: any): Promise<EducationResource> {
    // Create the base resource first
    const resourceData = {
      title: dto.title,
      description: dto.description,
      url: dto.url,
      imageUrl: dto.imageUrl,
      category: dto.category,
      status: dto.status || ResourceStatus.DRAFT,
    };

    const resource = this.resourceRepo.create(resourceData);

    // Save the resource first to get an ID
    const savedResource = await this.resourceRepo.save(resource);

    // Now handle relationships if provided
    if (dto.nextResourceId) {
      const nextResource = await this.resourceRepo.findOne({
        where: { id: dto.nextResourceId },
      });
      if (nextResource) {
        savedResource.nextResource = nextResource;
        await this.resourceRepo.save(savedResource);
      }
    }
    if (dto.parentId) {
      const parent = await this.resourceRepo.findOne({
        where: { id: dto.parentId },
      });
      if (parent) {
        savedResource.parent = parent;
        await this.resourceRepo.save(savedResource);
      }
    }

    return savedResource;
  }

  async findAll(): Promise<EducationResource[]> {
    return this.resourceRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findPublished(): Promise<EducationResource[]> {
    return this.resourceRepo.find({
      where: { status: ResourceStatus.PUBLISHED },
      order: { createdAt: 'DESC' },
    });
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
