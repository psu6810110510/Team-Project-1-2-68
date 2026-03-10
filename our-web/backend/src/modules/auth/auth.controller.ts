import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {

    // ให้ Frontend ยิงมาที่ http://localhost:3000/auth/google เพื่อเด้งหน้า Login
    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) { }

    // เมื่อ Login เสร็จ Google จะส่งข้อมูลกลับมาที่นี่
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    googleAuthRedirect(@Req() req) {
        // req.user จะมีข้อมูลอีเมลและชื่อที่ได้จาก Google
        return {
            message: 'Google Login Successful',
            user: req.user
        };
    }
}