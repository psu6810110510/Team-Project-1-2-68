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
          onsite_schedule: [
            { day: 'Monday', time_start: '09:00', time_end: '12:00' },
            { day: 'Wednesday', time_start: '09:00', time_end: '12:00' },
            { day: 'Friday', time_start: '09:00', time_end: '12:00' }
          ],
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
          onsite_schedule: [
            { day: 'Tuesday', time_start: '14:00', time_end: '17:00' },
            { day: 'Thursday', time_start: '14:00', time_end: '17:00' }
          ],
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

      // ============================================
      // 5. สร้าง Schedule ตัวอย่างสำหรับคอร์สที่เป็น onsite
      // ============================================
      const scheduleRepository = AppDataSource.getRepository(Schedule);
      // Clear existing schedules first to avoid duplicates
      await scheduleRepository.query('DELETE FROM schedules');

      // helper to create a Date for next week given weekday and time
      const nextDate = (weekday: number, time: string) => {
        const now = new Date();
        const date = new Date(now);
        // set to next occurrence of given weekday (0=Sunday)
        const diff = (weekday + 7 - date.getDay()) % 7 || 7;
        date.setDate(date.getDate() + diff);
        const [h, m] = time.split(':').map((v) => parseInt(v, 10));
        date.setHours(h, m, 0, 0);
        return date;
      };

      // fetch onsite courses and seed a few schedules
      const onsiteCourses = await courseRepository.find({ where: { is_onsite: true } });
      for (const course of onsiteCourses) {
        // create 3 upcoming schedules spaced one week apart
        for (let i = 0; i < 3; i++) {
          // pick first available day from course.onsite_schedule or default to Tuesday
          const dayName = (course.onsite_schedule && course.onsite_schedule[0]?.day) || 'Tuesday';
          const dayMap: Record<string, number> = {
            sunday: 0,
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
            saturday: 6,
          };
          const weekday = dayMap[dayName.toLowerCase()] ?? 2;
          const timeStart = (course.onsite_schedule && course.onsite_schedule[0]?.time_start) || '09:00';
          const timeEnd = (course.onsite_schedule && course.onsite_schedule[0]?.time_end) || '12:00';
          
          const start = nextDate(weekday, timeStart);
          const end = new Date(start);
          const [endH, endM] = timeEnd.split(':').map(Number);
          end.setHours(endH, endM, 0, 0);

          const schedule = scheduleRepository.create({
            course_id: course.id,
            start_time: start,
            end_time: end,
            // repository.create accepts undefined for optional fields, so
            // prefer undefined when there is no seat value instead of null
            max_onsite_seats: course.onsite_seats ?? undefined,
            room_location: 'อาคารเรียน 101',
          });
          await scheduleRepository.save(schedule);
        }
      }
      console.log('✅ สร้าง Schedule ตัวอย่างสำหรับคอร์ส onsite เสร็จ');

    // ดึงคอร์ส Full Stack ที่สร้างขึ้น
    const fullStackCourse = await courseRepository.findOne({
      where: { title: 'Full Stack Web Development' },
    });
    if (fullStackCourse) {
      // Helper function to get next date for a specific weekday
      const getNextDate = (weekday: number) => {
        const now = new Date();
        const date = new Date(now);
        const diff = (weekday + 7 - date.getDay()) % 7 || 7;
        date.setDate(date.getDate() + diff);
        return date;
      };

      // สร้าง schedules สำหรับ Tuesday (2), Thursday (4)
      const schedules = [
        { day: 'Tuesday', weekday: 2 },
        { day: 'Thursday', weekday: 4 },
      ];

      for (const schedule of schedules) {
        const dayDate = getNextDate(schedule.weekday);
        
        const startTime = new Date(dayDate);
        startTime.setHours(14, 0, 0, 0);
        
        const endTime = new Date(dayDate);
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

    console.log('\n🎉 Seed เสร็จสมบูรณ์!\n');
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
