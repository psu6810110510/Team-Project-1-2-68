import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule], // อิมพอร์ต ConfigModule เพื่อให้อ่านไฟล์ .env ได้
    controllers: [AuthController],
    providers: [GoogleStrategy],
})
export class AuthModule { }