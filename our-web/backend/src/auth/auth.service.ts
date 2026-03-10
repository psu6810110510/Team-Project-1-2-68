import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { User, UserRole } from '../entities/user.entity'; 
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // ✅ 1. เพิ่ม role เข้ามารับค่าจาก DTO
    const { email, password, full_name, phone, role } = registerDto;

    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.usersRepository.create({
      email,
      password_hash: hashedPassword,
      full_name, 
      phone,
      role: (role as UserRole) || UserRole.STUDENT, // ✅ บังคับ Type เป็น UserRole เส้นแดงจะหายไปทันที!
    });

    const savedUser = await this.usersRepository.save(user);

    const access_token = this.jwtService.sign({
      sub: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    });

    return {
      access_token,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        full_name: savedUser.full_name, 
        role: savedUser.role,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid email or password');
    }

    const access_token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name, 
        role: user.role,
        phone: user.phone,
      },
    };
  }

  // ✅ Google Login: หา user จาก email หรือสร้างใหม่ แล้วออก JWT token
  async googleLogin(googleUser: {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
    accessToken: string;
  }): Promise<AuthResponseDto> {
    if (!googleUser) {
      throw new BadRequestException('No user data from Google');
    }

    let user = await this.usersRepository.findOne({
      where: { email: googleUser.email },
    });

    if (!user) {
      // สร้าง user ใหม่จาก Google (ไม่มี password)
      user = this.usersRepository.create({
        email: googleUser.email,
        full_name: `${googleUser.firstName} ${googleUser.lastName}`.trim(),
        google_id: googleUser.email, // ใช้ email เป็น google_id
        image: googleUser.picture,
        role: UserRole.STUDENT,
        password_hash: null as any, // Google user ไม่มี password
      });
      user = await this.usersRepository.save(user);
    } else {
      // อัพเดทข้อมูลจาก Google ถ้ามี user อยู่แล้ว
      if (!user.google_id) {
        user.google_id = googleUser.email;
      }
      if (googleUser.picture && !user.image) {
        user.image = googleUser.picture;
      }
      if (!user.full_name && googleUser.firstName) {
        user.full_name = `${googleUser.firstName} ${googleUser.lastName}`.trim();
      }
      await this.usersRepository.save(user);
    }

    const access_token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    };
  }

  async findOne(id: any): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
    });
  }

  async validateUser(userId: string) {
    return this.usersRepository.findOne({
      where: { id: userId },
    });
  }

  async updateProfile(userId: any, updateData: any) {
    await this.usersRepository.update(userId, updateData);
    return this.usersRepository.findOne({ where: { id: userId } });
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new BadRequestException('รหัสผ่านเดิมไม่ถูกต้อง');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(userId, { password_hash: hashedNewPassword });

    return this.usersRepository.findOne({ where: { id: userId } }) as Promise<User>;
  }
}