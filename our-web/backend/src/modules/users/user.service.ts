import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../entities/user.entity';
import { Profile } from '../../entities/profile.entity';

export interface CreateUserDto {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface UpdateUserDto {
  first_name?: string;
  last_name?: string;
  phone?: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const userResult = await this.userRepo.insert({
      email: dto.email,
      password_hash: hashedPassword,
      role: UserRole.STUDENT,
    });

    // Fetch the created user
    const user = (await this.userRepo.findOne({ where: { id: userResult.identifiers[0].id } }))!;

    // Create profile
    await this.profileRepo.insert({
      user_id: user.id,
      first_name: dto.first_name || undefined,
      last_name: dto.last_name || undefined,
      phone: dto.phone || undefined,
    });

    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    // Update profile
    const profile = await this.profileRepo.findOne({ where: { user_id: id } });
    if (profile) {
      profile.first_name = dto.first_name || profile.first_name;
      profile.last_name = dto.last_name || profile.last_name;
      profile.phone = dto.phone || profile.phone;
      await this.profileRepo.save(profile);
    }

    return user;
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  async getAllUsers(limit = 10, offset = 0): Promise<[User[], number]> {
    return this.userRepo.findAndCount({
      take: limit,
      skip: offset,
      order: { created_at: 'DESC' },
    });
  }

  async getUserProfile(userId: string) {
    return this.profileRepo.findOne({ where: { user_id: userId } });
  }
}
