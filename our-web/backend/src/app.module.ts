import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // 1. เพิ่ม ConfigModule
import {
  User,
  Profile,
  Course,
  Schedule,
  Lesson,
  Exam,
  Question,
  Choice,
  Booking,
  ExamResult,
  SeatQuota,
  Payment,
} from './entities';


import { UserModule } from './modules/users/user.module';
import { CourseModule } from './modules/courses/course.module';
import { ExamModule } from './modules/exams/exam.module';
import { BookingModule } from './modules/bookings/booking.module';
import { SeatQuotaModule } from './modules/seat-quotas/seat-quota.module';
import { TeacherModule } from './modules/teachers/teacher.module';
import { UploadModule } from './upload/upload.module';
import { PaymentModule } from './modules/payments/payment.module';
import { AuthModule } from './auth/auth.module'; // ✅ Auth module หลัก (JWT + Google OAuth)

@Module({
  imports: [
    // 3. ตั้งค่าให้อ่านไฟล์ .env ได้ครอบคลุมทั้งโปรเจกต์
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      // ✅ รองรับทั้ง DATABASE_URL (Cloud) และแยกค่า (Local Docker)
      ...(process.env.DATABASE_URL
        ? {
            url: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
          }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5435'),
            username: process.env.DB_USERNAME || 'admin',
            password: process.env.DB_PASSWORD || 'password123',
            database: process.env.DB_NAME || 'Finalproy1_dev',
          }),
      entities: [
        User,
        Profile,
        Course,
        Schedule,
        Lesson,
        Exam,
        Question,
        Choice,
        Booking,
        ExamResult,
        SeatQuota,
        Payment,
      ],
      synchronize: true,
      logging: true,
    }),
    AuthModule,
    UserModule,
    CourseModule,
    ExamModule,
    BookingModule,
    SeatQuotaModule,
    TeacherModule,
    UploadModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }