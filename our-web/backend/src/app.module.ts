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
} from './entities';


import { UserModule } from './modules/users/user.module';
import { CourseModule } from './modules/courses/course.module';
import { ExamModule } from './modules/exams/exam.module';
import { BookingModule } from './modules/bookings/booking.module';
import { SeatQuotaModule } from './modules/seat-quotas/seat-quota.module';
import { TeacherModule } from './modules/teachers/teacher.module';
import { AuthModule } from './auth/auth.module'; // ✅ Auth module หลัก (JWT + Google OAuth)

@Module({
  imports: [
    // 3. ตั้งค่าให้อ่านไฟล์ .env ได้ครอบคลุมทั้งโปรเจกต์
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5435, // จากโค้ดคุณใช้พอร์ต 5435
      username: 'admin',
      password: 'password123',
      database: 'Finalproy1_dev',
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }