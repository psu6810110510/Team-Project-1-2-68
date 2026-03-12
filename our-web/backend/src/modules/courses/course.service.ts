import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course, CourseStatus, CourseLevel } from '../../entities/course.entity';
import { Lesson } from '../../entities/lesson.entity';

export interface CreateCourseRequestDto {
  title: string;
  description?: string;
  thumbnail_url?: string;
  video_url?: string;
  price?: number;
  level?: CourseLevel;
  instructor_id: string;
  instructor_name?: string;
  tags?: string;
  is_onsite?: boolean;
  onsite_seats?: number;
  onsite_days?: string[];
  onsite_time_start?: string;
  onsite_time_end?: string;
  onsite_duration?: string;
  onsite_exam_schedule?: string;
  is_online?: boolean;
  online_expiry?: string;
}

export interface UpdateCourseDto {
  title?: string;
  description?: string;
  thumbnail_url?: string;
  video_url?: string;
  price?: number;
  level?: CourseLevel;
  instructor_name?: string;
  tags?: string;
  is_onsite?: boolean;
  onsite_seats?: number;
  onsite_days?: string[];
  onsite_time_start?: string;
  onsite_time_end?: string;
  onsite_duration?: string;
  onsite_exam_schedule?: string;
  is_online?: boolean;
  online_expiry?: string;
}

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
  pdf_url?: string;
  sequence_order?: number;
}

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course) private courseRepo: Repository<Course>,
    @InjectRepository(Lesson) private lessonRepo: Repository<Lesson>,
  ) {}

  // ==========================================
  // Course Request & Workflow Methods
  // ==========================================

  async createCourseRequest(dto: CreateCourseRequestDto): Promise<Course> {
    try {
      console.log('Creating course request with data:', dto);
      
      const result = await this.courseRepo.insert({
        title: dto.title,
        description: dto.description,
        thumbnail_url: dto.thumbnail_url,
        video_url: dto.video_url,
        price: dto.price,
        level: dto.level,
        instructor_id: dto.instructor_id || undefined,
        instructor_name: dto.instructor_name,
        tags: dto.tags,
        status: CourseStatus.REQUEST_CREATE,
        is_onsite: dto.is_onsite || false,
        onsite_seats: dto.onsite_seats,
        onsite_days: dto.onsite_days,
        onsite_time_start: dto.onsite_time_start,
        onsite_time_end: dto.onsite_time_end,
        onsite_duration: dto.onsite_duration,
        onsite_exam_schedule: dto.onsite_exam_schedule,
        is_online: dto.is_online || false,
        online_expiry: dto.online_expiry,
        is_active: true,
      });

      return (await this.courseRepo.findOne({
        where: { id: result.identifiers[0].id },
        relations: ['instructor'],
      }))!;
    } catch (error) {
      console.error('Error creating course request:', error);
      throw error;
    }
  }

  async approveCreateRequest(id: string): Promise<Course> {
    const course = await this.getCourseById(id);
    if (course.status !== CourseStatus.REQUEST_CREATE) {
      throw new BadRequestException('Only courses in REQUEST_CREATE status can be approved for creation');
    }
    course.status = CourseStatus.DRAFTING;
    return this.courseRepo.save(course);
  }

  async rejectCreateRequest(id: string, reason?: string): Promise<Course> {
    const course = await this.getCourseById(id);
    if (course.status !== CourseStatus.REQUEST_CREATE) {
      throw new BadRequestException('Only courses in REQUEST_CREATE status can be rejected');
    }
    course.status = CourseStatus.REJECTED;
    course.rejection_reason = reason || 'Rejected by admin';
    return this.courseRepo.save(course);
  }

  async submitForReview(id: string): Promise<Course> {
    const course = await this.getCourseById(id);
    if (course.status !== CourseStatus.DRAFTING) {
      throw new BadRequestException('Only courses in DRAFTING status can be submitted for review');
    }
    course.status = CourseStatus.PENDING_REVIEW;
    return this.courseRepo.save(course);
  }

  async approvePublish(id: string): Promise<Course> {
    const course = await this.getCourseById(id);
    if (course.status !== CourseStatus.PENDING_REVIEW) {
      throw new BadRequestException('Only courses in PENDING_REVIEW status can be published');
    }
    course.status = CourseStatus.PUBLISHED;
    return this.courseRepo.save(course);
  }

  async rejectPublish(id: string, reason?: string): Promise<Course> {
    const course = await this.getCourseById(id);
    if (course.status !== CourseStatus.PENDING_REVIEW) {
      throw new BadRequestException('Only courses in PENDING_REVIEW status can be rejected');
    }
    course.status = CourseStatus.DRAFTING;
    course.rejection_reason = reason || 'Needs revision';
    return this.courseRepo.save(course);
  }

  async getCoursesByStatus(status: CourseStatus, limit = 50, offset = 0): Promise<[Course[], number]> {
    return this.courseRepo.findAndCount({
      where: { status, is_active: true },
      relations: ['instructor'],
      take: limit,
      skip: offset,
      order: { created_at: 'DESC' },
    });
  }

  async getCoursesByInstructor(instructorId: string, limit = 50, offset = 0): Promise<[Course[], number]> {
    return this.courseRepo.findAndCount({
      where: { instructor_id: instructorId, is_active: true },
      relations: ['instructor'],
      take: limit,
      skip: offset,
      order: { created_at: 'DESC' },
    });
  }

  async updateCourseDetails(id: string, dto: UpdateCourseDto): Promise<Course> {
    const course = await this.getCourseById(id);
    
    // Only allow updates for DRAFTING, PUBLISHED, or REJECTED courses
    if (![CourseStatus.DRAFTING, CourseStatus.PUBLISHED, CourseStatus.REJECTED].includes(course.status)) {
      throw new BadRequestException('Course cannot be edited in current status');
    }

    // If course was REJECTED, change status to REQUEST_CREATE for re-approval
    if (course.status === CourseStatus.REJECTED) {
      course.status = CourseStatus.REQUEST_CREATE;
      course.rejection_reason = ''; // Clear rejection reason
    }

    Object.assign(course, dto);
    return this.courseRepo.save(course);
  }

  // ==========================================
  // Original Methods (Updated)
  // ==========================================

  async createCourse(dto: CreateCourseDto): Promise<Course> {
    const result = await this.courseRepo.insert({
      title: dto.title,
      description: dto.description || undefined,
      thumbnail_url: dto.thumbnail_url || undefined,
      is_active: true,
    });

    return (await this.courseRepo.findOne({
      where: { id: result.identifiers[0].id },
    }))!;
  }

  async getCourseById(id: string): Promise<Course> {
    const course = await this.courseRepo.findOne({ 
      where: { id },
      relations: ['instructor'],
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }

  async getAllCourses(limit = 10, offset = 0, statusFilter?: CourseStatus): Promise<[Course[], number]> {
    const where: any = { is_active: true };
    
    // If status filter provided, use it; otherwise show only PUBLISHED for public
    if (statusFilter) {
      where.status = statusFilter;
    } else {
      where.status = CourseStatus.PUBLISHED;
    }

    return this.courseRepo.findAndCount({
      where,
      relations: ['instructor'],
      take: limit,
      skip: offset,
      order: { created_at: 'DESC' },
    });
  }

  async updateCourse(
    id: string,
    dto: Partial<CreateCourseDto>,
  ): Promise<Course> {
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

  async deleteCourse(id: string): Promise<void> {
    const course = await this.getCourseById(id);
    // Only allow deletion of courses that are not published
    if (course.status === CourseStatus.PUBLISHED) {
      throw new BadRequestException('Cannot delete published courses. Deactivate it instead.');
    }
    await this.courseRepo.remove(course);
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
      pdf_url: dto.pdf_url || undefined,
      sequence_order: dto.sequence_order || undefined,
    });

    return (await this.lessonRepo.findOne({
      where: { id: result.identifiers[0].id },
    }))!;
  }

  async getLessonById(id: string): Promise<Lesson> {
    const lesson = await this.lessonRepo.findOne({ where: { id } });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    return lesson;
  }

  async getLessonsByCourse(
    courseId: string,
    limit = 50,
    offset = 0,
  ): Promise<[Lesson[], number]> {
    // Verify course exists
    await this.getCourseById(courseId);

    return this.lessonRepo.findAndCount({
      where: { course_id: courseId },
      take: limit,
      skip: offset,
      order: { sequence_order: 'ASC' },
    });
  }

  async updateLesson(
    id: string,
    dto: Partial<CreateLessonDto>,
  ): Promise<Lesson> {
    const lesson = await this.getLessonById(id);
    Object.assign(lesson, dto);
    return this.lessonRepo.save(lesson);
  }
}
