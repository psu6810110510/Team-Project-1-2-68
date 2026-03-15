import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExamService } from './modules/exams/exam.service';
import { Course } from './entities/course.entity';
import { ExamType } from './entities/exam.entity';
import { QuestionType } from './entities/question.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const examService = app.get(ExamService);
  const courseRepo: Repository<Course> = app.get(getRepositoryToken(Course));
  
  // Find a course
  const courses = await courseRepo.find({ take: 1 });
  if (courses.length === 0) {
      console.log('No courses found! Please create a course first.');
      process.exit(1);
  }
  
  const courseId = courses[0].id;
  console.log(`Using course: ${courses[0].title} (ID: ${courseId})`);
  
  try {
      // 1. Create Exam
      const exam = await examService.createExam({
          course_id: courseId,
          title: 'แบบทดสอบตัวอย่าง: ความรู้พื้นฐานการเขียนโปรแกรม',
          description: 'แบบทดสอบนี้ใช้สำหรับทดสอบระบบ มีคำถามหลากหลายรูปแบบ',
          type: ExamType.PRETEST, // Explicitly use an allowed enum value
          total_score: 20
      });
      console.log('Created Exam:', exam.id);
      
      // 2. Create Question 1 (Multiple Choice)
      const q1 = await examService.createQuestion({
          exam_id: exam.id,
          question_text: 'ข้อใดคือตัวแปรที่เก็บค่าตัวเลขทศนิยมในภาษา C?',
          type: QuestionType.MULTIPLE_CHOICE,
          score_points: 5,
          sequence_order: 1
      });
      console.log('Created Q1:', q1.id);
      
      await examService.createChoice({ question_id: q1.id, choice_label: 'A', choice_text: 'int', is_correct: false });
      await examService.createChoice({ question_id: q1.id, choice_label: 'B', choice_text: 'float', is_correct: true });
      await examService.createChoice({ question_id: q1.id, choice_label: 'C', choice_text: 'char', is_correct: false });
      await examService.createChoice({ question_id: q1.id, choice_label: 'D', choice_text: 'boolean', is_correct: false });
      
      // 3. Create Question 2 (True/False)
      const q2 = await examService.createQuestion({
          exam_id: exam.id,
          question_text: 'HTML ย่อมาจาก HyperText Markup Language ใช่หรือไม่?',
          type: QuestionType.TRUE_FALSE,
          score_points: 5,
          sequence_order: 2
      });
      console.log('Created Q2:', q2.id);
      
      await examService.createChoice({ question_id: q2.id, choice_label: 'T', choice_text: 'จริง (True)', is_correct: true });
      await examService.createChoice({ question_id: q2.id, choice_label: 'F', choice_text: 'เท็จ (False)', is_correct: false });
      
      // 4. Create Question 3 (Short Answer)
      const q3 = await examService.createQuestion({
          exam_id: exam.id,
          question_text: 'เลขฐานสองของค่า 10 คืออะไร?',
          type: QuestionType.SHORT_ANSWER,
          score_points: 10,
          sequence_order: 3
      });
      console.log('Created Q3:', q3.id);
      
      console.log('Mock exam generated successfully!');
  } catch (err) {
      console.error('Error generating mock exam:', err);
  } finally {
      await app.close();
      process.exit(0);
  }
}

bootstrap();
