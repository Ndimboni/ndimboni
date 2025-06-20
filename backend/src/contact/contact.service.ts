import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { Contact, ContactStatus } from '../entities/contact.entity';
import {
  CreateContactDto,
  UpdateContactStatusDto,
  ContactResponseDto,
  ContactFiltersDto,
} from '../dto/contact.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  async create(
    createContactDto: CreateContactDto,
    user?: User,
  ): Promise<ContactResponseDto> {
    const contact = this.contactRepository.create({
      ...createContactDto,
      userId: user?.id,
    });

    const savedContact = await this.contactRepository.save(contact);
    return this.formatContactResponse(savedContact);
  }

  async findAll(filters: ContactFiltersDto): Promise<{
    contacts: ContactResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { status, category, search, page = 1, limit = 10 } = filters;

    const whereConditions: any = {};

    if (status) {
      whereConditions.status = status;
    }

    if (category) {
      whereConditions.category = category;
    }

    const options: FindManyOptions<Contact> = {
      where: whereConditions,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
    };

    if (search) {
      options.where = [
        { ...whereConditions, name: Like(`%${search}%`) },
        { ...whereConditions, email: Like(`%${search}%`) },
        { ...whereConditions, subject: Like(`%${search}%`) },
      ];
    }

    const [contacts, total] =
      await this.contactRepository.findAndCount(options);

    return {
      contacts: contacts.map((contact) => this.formatContactResponse(contact)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<ContactResponseDto> {
    const contact = await this.contactRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    return this.formatContactResponse(contact);
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateContactStatusDto,
    adminUser: User,
  ): Promise<ContactResponseDto> {
    const contact = await this.contactRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    // Update contact status and response
    contact.status = updateStatusDto.status;

    if (updateStatusDto.adminResponse) {
      contact.adminResponse = updateStatusDto.adminResponse;
      contact.respondedBy = adminUser.id;
      contact.respondedAt = new Date();
    }

    const updatedContact = await this.contactRepository.save(contact);
    return this.formatContactResponse(updatedContact);
  }

  async delete(id: string): Promise<void> {
    const contact = await this.contactRepository.findOne({ where: { id } });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    await this.contactRepository.remove(contact);
  }

  async getContactStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    closed: number;
  }> {
    const [total, pending, inProgress, resolved, closed] = await Promise.all([
      this.contactRepository.count(),
      this.contactRepository.count({
        where: { status: ContactStatus.PENDING },
      }),
      this.contactRepository.count({
        where: { status: ContactStatus.IN_PROGRESS },
      }),
      this.contactRepository.count({
        where: { status: ContactStatus.RESOLVED },
      }),
      this.contactRepository.count({
        where: { status: ContactStatus.CLOSED },
      }),
    ]);

    return {
      total,
      pending,
      inProgress,
      resolved,
      closed,
    };
  }

  private formatContactResponse(contact: Contact): ContactResponseDto {
    return {
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      subject: contact.subject,
      message: contact.message,
      category: contact.category,
      status: contact.status,
      adminResponse: contact.adminResponse,
      respondedBy: contact.respondedBy,
      respondedAt: contact.respondedAt,
      userId: contact.userId,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    };
  }
}
