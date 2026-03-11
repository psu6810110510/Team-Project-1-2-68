import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { Course } from './entities/course.entity';
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
  host: 'localhost',
  port: 5435,
  username: 'admin',
  password: 'password123',
  database: 'Finalproy1_dev',
  entities: [User, Profile, Course, Schedule, Lesson, Exam, Question, Choice, Booking, ExamResult, SeatQuota, Teacher],
  synchronize: false,
});

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const userRepository = AppDataSource.getRepository(User);

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
      console.log(`   📧 Email: ${adminEmail}`);
      console.log(`   🔑 Password: password123`);
    } else {
      console.log('ℹ️  Admin User มีอยู่แล้ว');
    }

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
