import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  full_name?: string;

  // 🔥 เพิ่มส่วนนี้เข้าไปครับ เพื่อบอกให้ระบบรู้ว่าอนุญาตให้รับเบอร์โทรได้
  @IsString()
  @IsOptional() // ใส่ IsOptional ไว้ เผื่อบางคนสมัครโดยไม่กรอกเบอร์ ระบบจะได้ไม่พังครับ
  phone?: string; 
}