import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exam, ExamType } from '../../entities/exam.entity';
import { Question, QuestionType } from '../../entities/question.entity';
import { Choice } from '../../entities/choice.entity';
import { Course } from '../../entities/course.entity';

export interface CreateExamDto {
  course_id: string;
  title: string;
  description?: string;
  type: ExamType;
  total_score?: number;
  start_time?: Date;
  end_time?: Date;
}

export interface CreateQuestionDto {
  exam_id: string;
  lesson_id?: string;
  question_text: string;
  type: QuestionType;
  score_points?: number;
  sequence_order?: number;
}

export interface CreateChoiceDto {
  question_id: string;
  choice_label: string;
  choice_text: string;
  is_correct: boolean;
}

@Injectable()
export class ExamService {
  constructor(
    @InjectRepository(Exam) private examRepo: Repository<Exam>,
    @InjectRepository(Question) private questionRepo: Repository<Question>,
    @InjectRepository(Choice) private choiceRepo: Repository<Choice>,
    @InjectRepository(Course) private courseRepo: Repository<Course>,
  ) {}

  async createExam(dto: CreateExamDto): Promise<Exam> {
    // Verify course exists
    const course = await this.courseRepo.findOne({ where: { id: dto.course_id } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const result = await this.examRepo.insert({
      course_id: dto.course_id,
      title: dto.title,
      description: dto.description || undefined,
      type: dto.type,
      total_score: dto.total_score || 100,
      start_time: dto.start_time || undefined,
      end_time: dto.end_time || undefined,
    });

    return (await this.examRepo.findOne({ where: { id: result.identifiers[0].id } }))!;
  }

  async getExamById(id: string): Promise<Exam> {
    const exam = await this.examRepo.findOne({ where: { id } });
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    return exam;
  }

  async getExamsByCourse(courseId: string): Promise<Exam[]> {
    // Verify course exists
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.examRepo.find({
      where: { course_id: courseId },
      order: { created_at: 'DESC' },
    });
  }

  // Question methods
  async createQuestion(dto: CreateQuestionDto): Promise<Question> {
    // Verify exam exists
    await this.getExamById(dto.exam_id);

    const result = await this.questionRepo.insert({
      exam_id: dto.exam_id,
      lesson_id: dto.lesson_id || undefined,
      question_text: dto.question_text,
      type: dto.type,
      score_points: dto.score_points || 1,
      sequence_order: dto.sequence_order || undefined,
    });

    return (await this.questionRepo.findOne({ where: { id: result.identifiers[0].id } }))!;
  }

  async getQuestionById(id: string): Promise<Question> {
    const question = await this.questionRepo.findOne({ where: { id } });
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    return question;
  }

  async getQuestionsByExam(examId: string): Promise<Question[]> {
    // Verify exam exists
    await this.getExamById(examId);

    return this.questionRepo.find({
      where: { exam_id: examId },
      order: { sequence_order: 'ASC' },
    });
  }

  // Choice methods
  async createChoice(dto: CreateChoiceDto): Promise<Choice> {
    // Verify question exists
    const question = await this.getQuestionById(dto.question_id);

    const choice = this.choiceRepo.create({
      question_id: dto.question_id,
      choice_label: dto.choice_label,
      choice_text: dto.choice_text,
      is_correct: dto.is_correct,
    });

    return this.choiceRepo.save(choice);
  }

  async getChoicesByQuestion(questionId: string): Promise<Choice[]> {
    // Verify question exists
    await this.getQuestionById(questionId);

    return this.choiceRepo.find({
      where: { question_id: questionId },
    });
  }

  async getFullExam(examId: string) {
    const exam = await this.getExamById(examId);
    const questions = await this.getQuestionsByExam(examId);

    const questionsWithChoices = await Promise.all(
      questions.map(async (q) => ({
        id: q.id,
        question_text: q.question_text,
        type: q.type,
        score_points: q.score_points,
        sequence_order: q.sequence_order,
        choices: await this.getChoicesByQuestion(q.id),
      })),
    );

    return {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      type: exam.type,
      total_score: exam.total_score,
      questions: questionsWithChoices,
    };
  }
}
