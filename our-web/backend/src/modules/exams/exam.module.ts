import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exam } from '../../entities/exam.entity';
import { Question } from '../../entities/question.entity';
import { Choice } from '../../entities/choice.entity';
import { Course } from '../../entities/course.entity';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Exam, Question, Choice, Course])],
  controllers: [ExamController],
  providers: [ExamService],
  exports: [ExamService],
})
export class ExamModule {}
