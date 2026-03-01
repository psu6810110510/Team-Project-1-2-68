import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ExamService } from './exam.service';
import type { CreateExamDto, CreateQuestionDto, CreateChoiceDto } from './exam.service';

@Controller('exams')
export class ExamController {
  constructor(private examService: ExamService) {}

  @Post()
  async createExam(@Body() dto: CreateExamDto) {
    const exam = await this.examService.createExam(dto);
    return {
      id: exam.id,
      title: exam.title,
      type: exam.type,
      message: 'Exam created successfully',
    };
  }

  @Get(':id')
  async getExam(@Param('id') id: string) {
    return this.examService.getFullExam(id);
  }

  @Get('course/:courseId')
  async getExamsByCourse(@Param('courseId') courseId: string) {
    const exams = await this.examService.getExamsByCourse(courseId);
    return {
      data: exams.map((e) => ({
        id: e.id,
        title: e.title,
        type: e.type,
        total_score: e.total_score,
        created_at: e.created_at,
      })),
      total: exams.length,
    };
  }

  // Questions endpoints
  @Post(':examId/questions')
  async createQuestion(@Param('examId') examId: string, @Body() dto: CreateQuestionDto) {
    const question = await this.examService.createQuestion({
      ...dto,
      exam_id: examId,
    });
    return {
      id: question.id,
      question_text: question.question_text,
      type: question.type,
      message: 'Question created successfully',
    };
  }

  @Get(':examId/questions')
  async getQuestionsByExam(@Param('examId') examId: string) {
    const questions = await this.examService.getQuestionsByExam(examId);
    return {
      data: questions.map((q) => ({
        id: q.id,
        question_text: q.question_text,
        type: q.type,
        score_points: q.score_points,
        sequence_order: q.sequence_order,
      })),
      total: questions.length,
      exam_id: examId,
    };
  }

  @Get('question/:questionId')
  async getQuestion(@Param('questionId') questionId: string) {
    const question = await this.examService.getQuestionById(questionId);
    const choices = await this.examService.getChoicesByQuestion(questionId);
    return {
      id: question.id,
      question_text: question.question_text,
      type: question.type,
      score_points: question.score_points,
      choices: choices.map((c) => ({
        id: c.id,
        choice_label: c.choice_label,
        choice_text: c.choice_text,
        // Don't expose is_correct to frontend during exam
      })),
    };
  }

  // Choices endpoints
  @Post('question/:questionId/choices')
  async createChoice(@Param('questionId') questionId: string, @Body() dto: CreateChoiceDto) {
    const choice = await this.examService.createChoice({
      ...dto,
      question_id: questionId,
    });
    return {
      id: choice.id,
      choice_label: choice.choice_label,
      message: 'Choice created successfully',
    };
  }

  @Get('question/:questionId/choices')
  async getChoicesByQuestion(@Param('questionId') questionId: string) {
    const choices = await this.examService.getChoicesByQuestion(questionId);
    return {
      data: choices.map((c) => ({
        id: c.id,
        choice_label: c.choice_label,
        choice_text: c.choice_text,
        is_correct: c.is_correct, // For admin only
      })),
      total: choices.length,
    };
  }
}
