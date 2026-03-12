<<<<<<< HEAD
import { AppDataSource } from './datasource';
import { Course } from './entities/course.entity';

async function seedCourses() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    const courseRepository = AppDataSource.getRepository(Course);

    // Check if courses already exist
    const existingCourses = await courseRepository.count();
    if (existingCourses > 0) {
      console.log(`Found ${existingCourses} existing courses. Skipping seed.`);
      return;
    }

    // Sample courses
    const sampleCourses = [
      {
        title: 'React.js สำหรับผู้เริ่มต้น',
        description: 'เรียนรู้พื้นฐาน React.js ตั้งแต่เริ่มต้นจนถึงการสร้าง Application ขั้นสูง รวมถึง Hooks, State Management และการทำงานกับ API',
        thumbnail_url: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=React.js',
        is_active: true,
      },
      {
        title: 'Node.js และ Express.js Backend Development',
        description: 'พัฒนา Backend ด้วย Node.js และ Express.js เรียนรู้การจัดการ Routing, Middleware, Database Integration และการสร้าง RESTful API',
        thumbnail_url: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Node.js',
        is_active: true,
      },
      {
        title: 'TypeScript พื้นฐานถึงขั้นสูง',
        description: 'เรียนรู้ TypeScript ตั้งแต่พื้นฐานจนถึงขั้นสูง รวมถึง Type System, Generics, Decorators และการใช้งานกับ Framework ต่างๆ',
        thumbnail_url: 'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=TypeScript',
        is_active: true,
      },
      {
        title: 'Database Design กับ PostgreSQL',
        description: 'ออกแบบฐานข้อมูลที่มีประสิทธิภาพด้วย PostgreSQL เรียนรู้เรื่อง Normalization, Indexing, และ Query Optimization',
        thumbnail_url: 'https://via.placeholder.com/300x200/EF4444/FFFFFF?text=PostgreSQL',
        is_active: true,
      },
      {
        title: 'Docker และ Kubernetes สำหรับ Developer',
        description: 'เรียนรู้การใช้ Docker และ Kubernetes สำหรับการพัฒนาและ部署แอปพลิเคชันในสภาพแวดล้อม Production',
        thumbnail_url: 'https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=Docker',
        is_active: true,
      },
      {
        title: 'Vue.js 3 Composition API',
        description: 'เรียนรู้ Vue.js 3 กับ Composition API การสร้าง Reactive Components และการจัดการ State ในแอปพลิเคชันขนาดใหญ่',
        thumbnail_url: 'https://via.placeholder.com/300x200/06B6D4/FFFFFF?text=Vue.js',
        is_active: true,
      },
      {
        title: 'Python สำหรับ Data Science',
        description: 'ใช้ Python สำหรับการวิเคราะห์ข้อมูล รวมถึง NumPy, Pandas, Matplotlib และการสร้าง Machine Learning Models',
        thumbnail_url: 'https://via.placeholder.com/300x200/84CC16/FFFFFF?text=Python',
        is_active: true,
      },
      {
        title: 'Flutter Mobile App Development',
        description: 'พัฒนาแอปพลิเคชันมือถือข้ามแพลตฟอร์มด้วย Flutter เรียนรู้ Widgets, State Management และการเชื่อมต่อกับ API',
        thumbnail_url: 'https://via.placeholder.com/300x200/EC4899/FFFFFF?text=Flutter',
        is_active: true,
      },
    ];

    // Insert courses
    for (const courseData of sampleCourses) {
      const course = courseRepository.create(courseData);
      await courseRepository.save(course);
      console.log(`Created course: ${course.title}`);
    }

    console.log(`Successfully seeded ${sampleCourses.length} courses`);
  } catch (error) {
    console.error('Error seeding courses:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run the seed function
seedCourses().catch(console.error);
=======
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
>>>>>>> e2e151cc443080558a267cbd5dbba1d0c8e405f0
