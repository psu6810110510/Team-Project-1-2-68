import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ExamService } from './exam.service';
import type {
  CreateExamDto,
  CreateQuestionDto,
  CreateChoiceDto,
  UpdateExamDto,
  UpdateQuestionDto,
  UpdateChoiceDto,
  SubmitExamDto,
} from './exam.service';

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

  @Get()
  async getAllExams() {
    const exams = await this.examService.getAllExams();
    return {
      data: exams,
      total: exams.length,
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

  @Put(':id')
  async updateExam(@Param('id') id: string, @Body() dto: UpdateExamDto) {
    const exam = await this.examService.updateExam(id, dto);
    return {
      id: exam.id,
      title: exam.title,
      type: exam.type,
      message: 'Exam updated successfully',
    };
  }

  @Delete(':id')
  async deleteExam(@Param('id') id: string) {
    await this.examService.deleteExam(id);
    return {
      message: 'Exam deleted successfully',
    };
  }

  // Questions endpoints
  @Post(':examId/questions')
  async createQuestion(
    @Param('examId') examId: string,
    @Body() dto: CreateQuestionDto,
  ) {
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

  @Put('question/:id')
  async updateQuestion(@Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    const question = await this.examService.updateQuestion(id, dto);
    return {
      id: question.id,
      question_text: question.question_text,
      message: 'Question updated successfully',
    };
  }

  @Delete('question/:id')
  async deleteQuestion(@Param('id') id: string) {
    await this.examService.deleteQuestion(id);
    return {
      message: 'Question deleted successfully',
    };
  }

  // Choices endpoints
  @Post('question/:questionId/choices')
  async createChoice(
    @Param('questionId') questionId: string,
    @Body() dto: CreateChoiceDto,
  ) {
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

  @Put('choice/:id')
  async updateChoice(@Param('id') id: string, @Body() dto: UpdateChoiceDto) {
    const choice = await this.examService.updateChoice(id, dto);
    return {
      id: choice.id,
      choice_label: choice.choice_label,
      choice_text: choice.choice_text,
      message: 'Choice updated successfully',
    };
  }

  @Delete('choice/:id')
  async deleteChoice(@Param('id') id: string) {
    await this.examService.deleteChoice(id);
    return {
      message: 'Choice deleted successfully',
    };
  }

  // ---------- STUDENT endpoints ----------

  @Get('student/:examId/take')
  async getExamForStudent(@Param('examId') examId: string) {
    return this.examService.getExamForStudent(examId);
  }

  @Post(':examId/submit')
  async submitExam(@Param('examId') examId: string, @Body() dto: SubmitExamDto) {
    const result = await this.examService.submitExam(examId, dto);
    return {
      id: result.id,
      total_score: result.total_score,
      percentage: result.percentage,
      total_questions: result.total_questions,
      correct_answers: result.correct_answers,
      wrong_answers: result.wrong_answers,
      message: 'Exam submitted successfully',
    };
  }

  @Get('student/results/:userId')
  async getStudentResults(@Param('userId') userId: string) {
    const results = await this.examService.getStudentResults(userId);
    return { data: results, total: results.length };
  }
}
