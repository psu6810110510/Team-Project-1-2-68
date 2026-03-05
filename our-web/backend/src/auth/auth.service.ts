import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, full_name, phone } = registerDto;

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
      full_name, // ✅ บันทึกชื่อเต็มลงฐานข้อมูล
      phone,
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
        full_name: savedUser.full_name, // ✅ ส่งกลับไปให้ Frontend
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
        full_name: user.full_name, // ✅ ส่งกลับไปให้ Frontend
        role: user.role,
        phone: user.phone,
      },
    };
  }

  // ✅ เพิ่มฟังก์ชันนี้เพื่อใช้ดึงข้อมูล Profile เต็มรูปแบบ
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
}

