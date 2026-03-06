import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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

export interface UpdateExamDto {
  title?: string;
  description?: string;
  type?: ExamType;
  total_score?: number;
  start_time?: Date;
  end_time?: Date;
}

export interface UpdateQuestionDto {
  question_text?: string;
  type?: QuestionType;
  score_points?: number;
  sequence_order?: number;
  lesson_id?: string;
}

export interface UpdateChoiceDto {
  choice_label?: string;
  choice_text?: string;
  is_correct?: boolean;
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
    const course = await this.courseRepo.findOne({
      where: { id: dto.course_id },
    });
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

    return (await this.examRepo.findOne({
      where: { id: result.identifiers[0].id },
    }))!;
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

  async updateExam(id: string, dto: UpdateExamDto): Promise<Exam> {
    const exam = await this.getExamById(id);
    
    // Update only provided fields
    if (dto.title !== undefined) exam.title = dto.title;
    if (dto.description !== undefined) exam.description = dto.description;
    if (dto.type !== undefined) exam.type = dto.type;
    if (dto.total_score !== undefined) exam.total_score = dto.total_score;
    if (dto.start_time !== undefined) exam.start_time = dto.start_time;
    if (dto.end_time !== undefined) exam.end_time = dto.end_time;

    return this.examRepo.save(exam);
  }

  async deleteExam(id: string): Promise<void> {
    const exam = await this.getExamById(id);
    await this.examRepo.remove(exam);
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

    return (await this.questionRepo.findOne({
      where: { id: result.identifiers[0].id },
    }))!;
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

  async updateQuestion(id: string, dto: UpdateQuestionDto): Promise<Question> {
    const question = await this.getQuestionById(id);
    
    // Update only provided fields
    if (dto.question_text !== undefined) question.question_text = dto.question_text;
    if (dto.type !== undefined) question.type = dto.type;
    if (dto.score_points !== undefined) question.score_points = dto.score_points;
    if (dto.sequence_order !== undefined) question.sequence_order = dto.sequence_order;
    if (dto.lesson_id !== undefined) question.lesson_id = dto.lesson_id;

    return this.questionRepo.save(question);
  }

  async deleteQuestion(id: string): Promise<void> {
    const question = await this.getQuestionById(id);
    await this.questionRepo.remove(question);
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

  async updateChoice(id: string, dto: UpdateChoiceDto): Promise<Choice> {
    const choice = await this.choiceRepo.findOne({ where: { id } });
    if (!choice) {
      throw new NotFoundException('Choice not found');
    }

    // Update only provided fields
    if (dto.choice_label !== undefined) choice.choice_label = dto.choice_label;
    if (dto.choice_text !== undefined) choice.choice_text = dto.choice_text;
    if (dto.is_correct !== undefined) choice.is_correct = dto.is_correct;

    return this.choiceRepo.save(choice);
  }

  async deleteChoice(id: string): Promise<void> {
    const choice = await this.choiceRepo.findOne({ where: { id } });
    if (!choice) {
      throw new NotFoundException('Choice not found');
    }
    await this.choiceRepo.remove(choice);
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
