import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../../entities/course.entity';
import { Lesson } from '../../entities/lesson.entity';

export interface CreateCourseDto {
  title: string;
  description?: string;
  thumbnail_url?: string;
}

export interface CreateLessonDto {
  course_id: string;
  topic_name: string;
  content?: string;
  video_url?: string;
  sequence_order?: number;
}

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course) private courseRepo: Repository<Course>,
    @InjectRepository(Lesson) private lessonRepo: Repository<Lesson>,
  ) {}

  async createCourse(dto: CreateCourseDto): Promise<Course> {
    const result = await this.courseRepo.insert({
      title: dto.title,
      description: dto.description || undefined,
      thumbnail_url: dto.thumbnail_url || undefined,
      is_active: true,
    });

    return (await this.courseRepo.findOne({ where: { id: result.identifiers[0].id } }))!;
  }

  async getCourseById(id: string): Promise<Course> {
    const course = await this.courseRepo.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }

  async getAllCourses(limit = 10, offset = 0): Promise<[Course[], number]> {
    return this.courseRepo.findAndCount({
      where: { is_active: true },
      take: limit,
      skip: offset,
      order: { created_at: 'DESC' },
    });
  }

  async updateCourse(id: string, dto: Partial<CreateCourseDto>): Promise<Course> {
    const course = await this.getCourseById(id);
    Object.assign(course, dto);
    return this.courseRepo.save(course);
  }

  async activateCourse(id: string): Promise<Course> {
    const course = await this.getCourseById(id);
    course.is_active = true;
    return this.courseRepo.save(course);
  }

  async deactivateCourse(id: string): Promise<Course> {
    const course = await this.getCourseById(id);
    course.is_active = false;
    return this.courseRepo.save(course);
  }

  // Lesson methods
  async createLesson(dto: CreateLessonDto): Promise<Lesson> {
    // Verify course exists
    await this.getCourseById(dto.course_id);

    const result = await this.lessonRepo.insert({
      course_id: dto.course_id,
      topic_name: dto.topic_name,
      content: dto.content || undefined,
      video_url: dto.video_url || undefined,
      sequence_order: dto.sequence_order || undefined,
    });

    return (await this.lessonRepo.findOne({ where: { id: result.identifiers[0].id } }))!;
  }

  async getLessonById(id: string): Promise<Lesson> {
    const lesson = await this.lessonRepo.findOne({ where: { id } });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    return lesson;
  }

  async getLessonsByCourse(courseId: string, limit = 50, offset = 0): Promise<[Lesson[], number]> {
    // Verify course exists
    await this.getCourseById(courseId);

    return this.lessonRepo.findAndCount({
      where: { course_id: courseId },
      take: limit,
      skip: offset,
      order: { sequence_order: 'ASC' },
    });
  }

  async updateLesson(id: string, dto: Partial<CreateLessonDto>): Promise<Lesson> {
    const lesson = await this.getLessonById(id);
    Object.assign(lesson, dto);
    return this.lessonRepo.save(lesson);
  }
}
