import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Patch,
  Request,
  Req,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Response } from 'express';

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

  // ✅ Google OAuth: เด้งไปหน้า Login ของ Google
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Guard จะ redirect ไป Google เอง
  }

  // ✅ Google OAuth Callback: Google ส่งข้อมูลกลับมาที่นี่
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const result = await this.authService.googleLogin(req.user);

    // Redirect กลับไป Frontend พร้อม token และข้อมูล user
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const userDataEncoded = encodeURIComponent(JSON.stringify(result.user));
    const redirectUrl = `${frontendUrl}/auth/google/callback?token=${result.access_token}&user=${userDataEncoded}`;

    return res.redirect(redirectUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Request() req, @Body() updateData: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;

    if (!userId) {
      throw new BadRequestException('ไม่พบ User ID ในระบบ กรุณาล็อกอินใหม่');
    }

    return this.authService.updateProfile(userId, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) {
      throw new BadRequestException('ไม่พบ User ID ในระบบ กรุณาล็อกอินใหม่');
    }
    const user = await this.authService.findOne(userId);

    if (user) {
      delete (user as any).password_hash;
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
