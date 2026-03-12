import { DataSource } from 'typeorm';
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

export const AppDataSource = new DataSource({
  type: 'postgres',
  // รองรับทั้ง DATABASE_URL (Cloud) และแยกค่า (Local Docker)
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
  ],
  synchronize: true,
  logging: true,
});
