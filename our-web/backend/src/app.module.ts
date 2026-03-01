import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
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
} from './entities';
import { UserModule } from './modules/users/user.module';
import { CourseModule } from './modules/courses/course.module';
import { ExamModule } from './modules/exams/exam.module';
import { BookingModule } from './modules/bookings/booking.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5435,
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
      ],
      synchronize: true,
      logging: true,
    }),
    UserModule,
    CourseModule,
    ExamModule,
    BookingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}