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
