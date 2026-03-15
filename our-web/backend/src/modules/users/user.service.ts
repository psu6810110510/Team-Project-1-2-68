import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../entities/user.entity';
import { Profile } from '../../entities/profile.entity';
import { Course } from '../../entities/course.entity';

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
    @InjectRepository(Course) private courseRepo: Repository<Course>,
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
    const user = (await this.userRepo.findOne({
      where: { id: userResult.identifiers[0].id },
    }))!;

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

  async getAllUsers(limit = 10, offset = 0, role?: string): Promise<[User[], number]> {
    const where: any = {};
    if (role) {
      where.role = role;
    }
    return this.userRepo.findAndCount({
      where,
      take: limit,
      skip: offset,
      order: { created_at: 'DESC' },
    });
  }

  async getUserProfile(userId: string) {
    return this.profileRepo.findOne({ where: { user_id: userId } });
  }

  async getDashboardStats() {
    const totalStudents = await this.userRepo.count({
      where: { role: UserRole.STUDENT },
    });
    const totalTeachers = await this.userRepo.count({
      where: { role: UserRole.TEACHER },
    });
    
    return {
      totalStudents,
      totalTeachers
    };
  }

  // Favorite courses methods
  async getUserFavorites(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['favorite_courses'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      favorites: user.favorite_courses.map((course) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnail_url: course.thumbnail_url,
        price: course.price,
        instructor_name: course.instructor_name,
        students_enrolled: course.students_enrolled,
      })),
    };
  }

  async addFavoriteCourse(userId: string, courseId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['favorite_courses'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const course = await this.courseRepo.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if already favorited
    const alreadyFavorited = user.favorite_courses.some((c) => c.id === courseId);
    if (alreadyFavorited) {
      return { message: 'Course already in favorites' };
    }

    user.favorite_courses.push(course);
    await this.userRepo.save(user);

    return { message: 'Course added to favorites' };
  }

  async removeFavoriteCourse(userId: string, courseId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['favorite_courses'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.favorite_courses = user.favorite_courses.filter((c) => c.id !== courseId);
    await this.userRepo.save(user);

    return { message: 'Course removed from favorites' };
  }
}
