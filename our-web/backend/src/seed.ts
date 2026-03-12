import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';

import { Profile } from './entities/profile.entity';
import { Course, CourseStatus, CourseLevel } from './entities/course.entity';
import { Schedule } from './entities/schedule.entity';
import { Lesson } from './entities/lesson.entity';
import { Exam } from './entities/exam.entity';
import { Question } from './entities/question.entity';
import { Choice } from './entities/choice.entity';
import { Booking } from './entities/booking.entity';
import { ExamResult } from './entities/exam-result.entity';
import { SeatQuota } from './entities/seat-quota.entity';
import { Teacher } from './entities/teacher.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
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
  entities: [User, Profile, Course, Schedule, Lesson, Exam, Question, Choice, Booking, ExamResult, SeatQuota, Teacher],
  synchronize: false,
});

// Helper function to get next occurrence of a day (0 = Sunday, 1 = Monday, etc.)
function getNextDay(from: Date, dayOfWeek: number): Date {
  const result = new Date(from);
  const current = result.getDay();
  const daysAhead = dayOfWeek - current;
  if (daysAhead <= 0) {
    result.setDate(result.getDate() + daysAhead + 7);
  } else {
    result.setDate(result.getDate() + daysAhead);
  }
  return result;
}

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const userRepository = AppDataSource.getRepository(User);
    const courseRepository = AppDataSource.getRepository(Course);

    // ============================================
    // 1. สร้าง ADMIN User
    // ============================================
    const adminEmail = 'admin@born2code.com';
    let adminUser = await userRepository.findOne({ where: { email: adminEmail } });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      adminUser = userRepository.create({
        email: adminEmail,
        password_hash: hashedPassword,
        full_name: 'ผู้ดูแลระบบ Admin',
        phone: '081-111-1111',
        role: UserRole.ADMIN,
        is_active: true,
      });
      await userRepository.save(adminUser);
      console.log('✅ สร้าง Admin User สำเร็จ');
    } else {
      const hashedPassword = await bcrypt.hash('password123', 10);
      adminUser.password_hash = hashedPassword;
      adminUser.role = UserRole.ADMIN; // Ensure they are admin
      await userRepository.save(adminUser);
      console.log('ℹ️  อัปเดตรหัสผ่าน Admin เรียบร้อยแล้ว');
    }
    console.log(`   📧 Email: ${adminEmail}`);
    console.log(`   🔑 Password: password123`);

    // ============================================
    // 2. สร้าง TEACHER User
    // ============================================
    const teacherEmail = 'teacher@born2code.com';
    let teacherUser = await userRepository.findOne({ where: { email: teacherEmail } });

    if (!teacherUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      teacherUser = userRepository.create({
        email: teacherEmail,
        password_hash: hashedPassword,
        full_name: 'อาจารย์ ใจดี สอนเก่ง',
        phone: '081-222-2222',
        role: UserRole.TEACHER,
        is_active: true,
        description: '"ความรู้คืออาวุธ"',
      });
      await userRepository.save(teacherUser);
      console.log('✅ สร้าง Teacher User สำเร็จ');
      console.log(`   📧 Email: ${teacherEmail}`);
      console.log(`   🔑 Password: password123`);
    } else {
      console.log('ℹ️  Teacher User มีอยู่แล้ว');
    }

    // ============================================
    // 3. สร้าง STUDENT User (ตัวอย่าง)
    // ============================================
    const studentEmail = 'student@born2code.com';
    let studentUser = await userRepository.findOne({ where: { email: studentEmail } });

    if (!studentUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      studentUser = userRepository.create({
        email: studentEmail,
        password_hash: hashedPassword,
        full_name: 'นักเรียน ทดสอบ',
        phone: '081-333-3333',
        role: UserRole.STUDENT,
        is_active: true,
      });
      await userRepository.save(studentUser);
      console.log('✅ สร้าง Student User สำเร็จ');
      console.log(`   📧 Email: ${studentEmail}`);
      console.log(`   🔑 Password: password123`);
    } else {
      console.log('ℹ️  Student User มีอยู่แล้ว');
    }

    // ============================================
    // ============================================
    // 4. สร้างคอร์ส
    // ============================================
    
    // Delete all existing courses first
    await courseRepository.query('DELETE FROM courses');
    console.log('✅ ลบข้อมูลคอร์สเก่า');

    const coursesData: Partial<Course>[] = [
        {
          title: 'TypeScript Fundamentals',
          description: 'เรียนรู้ TypeScript ตั้งแต่พื้นฐาน เหมาะสำหรับผู้เริ่มต้น',
          thumbnail_url: 'https://via.placeholder.com/300x200?text=TypeScript',
          video_url: 'https://example.com/typescript-intro.mp4',
          price: 1499,
          level: CourseLevel.BEGINNER,
          instructor_id: teacherUser.id,
          instructor_name: 'อาจารย์ ใจดี สอนเก่ง',
          tags: 'typescript,javascript,programming',
          is_onsite: false,
          is_online: true,
          online_expiry: '90 days',
          status: CourseStatus.PUBLISHED,
          is_active: true,
          students_enrolled: 25,
        },
        {
          title: 'React Advanced Patterns',
          description: 'เรียนรู้ React Patterns ขั้นสูง เพื่อเขียนโค้ดที่เป็นมืออาชีพ',
          thumbnail_url: 'https://via.placeholder.com/300x200?text=React',
          video_url: 'https://example.com/react-advanced.mp4',
          price: 2499,
          level: CourseLevel.INTERMEDIATE,
          instructor_id: teacherUser.id,
          instructor_name: 'อาจารย์ ใจดี สอนเก่ง',
          tags: 'react,javascript,frontend',
          is_onsite: false,
          is_online: true,
          online_expiry: '120 days',
          status: CourseStatus.PUBLISHED,
          is_active: true,
          students_enrolled: 18,
        },
        {
          title: 'NestJS Backend Development',
          description: 'พัฒนา Backend ด้วย NestJS Framework',
          thumbnail_url: 'https://via.placeholder.com/300x200?text=NestJS',
          video_url: 'https://example.com/nestjs-course.mp4',
          price: 1999,
          level: CourseLevel.INTERMEDIATE,
          instructor_id: teacherUser.id,
          instructor_name: 'อาจารย์ ใจดี สอนเก่ง',
          tags: 'nestjs,backend,nodejs',
          is_onsite: true,
          onsite_seats: 30,
          onsite_days: ['Monday', 'Wednesday', 'Friday'],
          onsite_time_start: '09:00',
          onsite_time_end: '12:00',
          onsite_duration: '6 weeks',
          is_online: true,
          online_expiry: '60 days',
          status: CourseStatus.PUBLISHED,
          is_active: true,
          students_enrolled: 42,
        },
        {
          title: 'Database Design & SQL Mastery',
          description: 'ออกแบบ Database และเขียน SQL ที่มีประสิทธิภาพ',
          thumbnail_url: 'https://via.placeholder.com/300x200?text=Database',
          video_url: 'https://example.com/database-course.mp4',
          price: 1799,
          level: CourseLevel.HARD,
          instructor_id: teacherUser.id,
          instructor_name: 'อาจารย์ ใจดี สอนเก่ง',
          tags: 'database,sql,postgresql',
          is_onsite: false,
          is_online: true,
          online_expiry: '180 days',
          status: CourseStatus.PUBLISHED,
          is_active: true,
          students_enrolled: 15,
        },
        {
          title: 'Full Stack Web Development',
          description: 'เรียนรู้ Full Stack Development ด้วย React และ NestJS',
          thumbnail_url: 'https://via.placeholder.com/300x200?text=FullStack',
          video_url: 'https://example.com/fullstack-course.mp4',
          price: 3999,
          level: CourseLevel.INTERMEDIATE,
          instructor_id: teacherUser.id,
          instructor_name: 'อาจารย์ ใจดี สอนเก่ง',
          tags: 'fullstack,react,nodejs,backend',
          is_onsite: true,
          onsite_seats: 25,
          onsite_days: ['Tuesday', 'Thursday'],
          onsite_time_start: '14:00',
          onsite_time_end: '17:00',
          onsite_duration: '8 weeks',
          is_online: true,
          online_expiry: '365 days',
          status: CourseStatus.PUBLISHED,
          is_active: true,
          students_enrolled: 52,
        },
      ];

      for (const courseData of coursesData) {
        const course = courseRepository.create(courseData);
        await courseRepository.save(course);
      }
      console.log('✅ สร้างคอร์ส 5 รายการสำเร็จ');

      // สร้าง Schedules สำหรับคอร์สที่เป็น Onsite
      const scheduleRepository = AppDataSource.getRepository(Schedule);
      
      // ดึงคอร์ส NestJS ที่สร้างขึ้น
      const nestjsCourse = await courseRepository.findOne({
        where: { title: 'NestJS Backend Development' },
      });
      if (nestjsCourse) {
        const today = new Date();
        // สร้าง schedules สำหรับ Monday, Wednesday, Friday
        const schedules = [
          { day: 'Monday', dayOffset: getNextDay(today, 1) }, // Monday
          { day: 'Wednesday', dayOffset: getNextDay(today, 3) }, // Wednesday  
          { day: 'Friday', dayOffset: getNextDay(today, 5) }, // Friday
        ];

        for (const schedule of schedules) {
          const startTime = new Date(schedule.dayOffset);
          startTime.setHours(9, 0, 0, 0);
          
          const endTime = new Date(schedule.dayOffset);
          endTime.setHours(12, 0, 0, 0);

          const scheduleEntry = scheduleRepository.create({
            course_id: nestjsCourse.id,
            start_time: startTime,
            end_time: endTime,
            max_onsite_seats: 30,
            room_location: 'Room 301, Building A',
          });
          await scheduleRepository.save(scheduleEntry);
        }
        console.log('✅ สร้าง Schedules สำหรับ NestJS Course');
      }

      // ดึงคอร์ส Full Stack ที่สร้างขึ้น
      const fullStackCourse = await courseRepository.findOne({
        where: { title: 'Full Stack Web Development' },
      });
      if (fullStackCourse) {
        const today = new Date();
        // สร้าง schedules สำหรับ Tuesday, Thursday
        const schedules = [
          { day: 'Tuesday', dayOffset: getNextDay(today, 2) }, // Tuesday
          { day: 'Thursday', dayOffset: getNextDay(today, 4) }, // Thursday
        ];

        for (const schedule of schedules) {
          const startTime = new Date(schedule.dayOffset);
          startTime.setHours(14, 0, 0, 0);
          
          const endTime = new Date(schedule.dayOffset);
          endTime.setHours(17, 0, 0, 0);

          const scheduleEntry = scheduleRepository.create({
            course_id: fullStackCourse.id,
            start_time: startTime,
            end_time: endTime,
            max_onsite_seats: 25,
            room_location: 'Room 202, Building B',
          });
          await scheduleRepository.save(scheduleEntry);
        }
        console.log('✅ สร้าง Schedules สำหรับ Full Stack Course');
      }
    
    console.log('📝 บัญชีที่สร้างขึ้น:');
    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│ Role      │ Email                    │ Password      │');
    console.log('├─────────────────────────────────────────────────────┤');
    console.log('│ ADMIN     │ admin@born2code.com      │ password123   │');
    console.log('│ TEACHER   │ teacher@born2code.com    │ password123   │');
    console.log('│ STUDENT   │ student@born2code.com    │ password123   │');
    console.log('└─────────────────────────────────────────────────────┘\n');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
