import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Patch,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Request() req, @Body() updateData: any) {
    // 🔥 ดักจับ ID ทุกรูปแบบที่ระบบอาจจะส่งมาให้
    const userId = req.user?.sub || req.user?.id || req.user?.userId;

    // 🔥 ป้องกันความผิดพลาด: ถ้าหา ID ไม่เจอจริงๆ ให้ฟ้อง Error สวยๆ กลับไป ดีกว่าปล่อยให้ฐานข้อมูลพัง
    if (!userId) {
      throw new BadRequestException('ไม่พบ User ID ในระบบ กรุณาล็อกอินใหม่');
    }

    return this.authService.updateProfile(userId, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    // req.user.sub หรือ req.user.userId คือ ID ที่ได้จาก JWT
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      throw new BadRequestException('ไม่พบ User ID ในระบบ กรุณาล็อกอินใหม่');
    }
    const user = await this.authService.findOne(userId);

    if (user) {
      delete (user as any).password_hash; // เติม (user as any)
    }
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(@Request() req, @Body() body: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      throw new BadRequestException('ไม่พบ User ID ในระบบ กรุณาล็อกอินใหม่');
    }

    const { oldPassword, newPassword } = body;
    if (!oldPassword || !newPassword) {
      throw new BadRequestException('กรุณาระบุรหัสผ่านเดิมและรหัสผ่านใหม่');
    }

    return this.authService.changePassword(userId, oldPassword, newPassword);
  }
}
