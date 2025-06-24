import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from '../common/interfaces/user.interface';
import { RegisterDto } from '../dto/auth.dto';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: [
        'id',
        'email',
        'name',
        'role',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'name',
        'role',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'name',
        'password',
        'role',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async create(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcryptjs.hash(registerDto.password, 10);
    const newUser = this.userRepository.create({
      email: registerDto.email,
      name: registerDto.name,
      password: hashedPassword,
      role: UserRole.USER,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(newUser);

    // Return user without password
    const { password: _password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as User;
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateData.password) {
      updateData.password = await bcryptjs.hash(updateData.password, 10);
    }

    await this.userRepository.update(id, updateData);

    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }

    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmailWithPassword(email);
    if (user && (await user.validatePassword(password))) {
      const { password: _, ...result } = user;
      return result as User;
    }
    return null;
  }
}
