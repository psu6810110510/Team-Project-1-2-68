import { Controller, Get, Post, Put, Delete, Body, Param, Query, Patch, HttpCode } from '@nestjs/common';
import { CourseService } from './course.service';
import type { CreateCourseDto, CreateLessonDto, CreateCourseRequestDto, UpdateCourseDto } from './course.service';
import { CourseStatus } from '../../entities/course.entity';

@Controller('courses')
export class CourseController {
  constructor(private courseService: CourseService) {}

  // ==========================================
  // Course Request & Workflow Endpoints
  // ==========================================

  @Post('request')
  async createCourseRequest(@Body() dto: CreateCourseRequestDto) {
    const course = await this.courseService.createCourseRequest(dto);
    return {
      id: course.id,
      title: course.title,
      status: course.status,
      message: 'Course request submitted successfully',
    };
  }

  @Post(':id/approve-create')
  async approveCreateRequest(@Param('id') id: string) {
    const course = await this.courseService.approveCreateRequest(id);
    return {
      id: course.id,
      status: course.status,
      message: 'Course creation approved',
    };
  }

  @Post(':id/reject-create')
  async rejectCreateRequest(@Param('id') id: string, @Body() body: { reason?: string }) {
    const course = await this.courseService.rejectCreateRequest(id, body.reason);
    return {
      id: course.id,
      status: course.status,
      message: 'Course creation rejected',
    };
  }

  @Post(':id/submit-review')
  async submitForReview(@Param('id') id: string) {
    const course = await this.courseService.submitForReview(id);
    return {
      id: course.id,
      status: course.status,
      message: 'Course submitted for review',
    };
  }

  @Post(':id/approve-publish')
  async approvePublish(@Param('id') id: string) {
    const course = await this.courseService.approvePublish(id);
    return {
      id: course.id,
      status: course.status,
      message: 'Course published successfully',
    };
  }

  @Post(':id/reject-publish')
  async rejectPublish(@Param('id') id: string, @Body() body: { reason?: string }) {
    const course = await this.courseService.rejectPublish(id, body.reason);
    return {
      id: course.id,
      status: course.status,
      message: 'Course rejected, returned to drafting',
    };
  }

  @Get('by-status/:status')
  async getCoursesByStatus(
    @Param('status') status: CourseStatus,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    const [courses, total] = await this.courseService.getCoursesByStatus(
      status,
      Number(limit),
      Number(offset),
    );
    return {
      data: courses.map((c) => this.mapCourseToResponse(c)),
      total,
      limit: Number(limit),
      offset: Number(offset),
    };
  }

  @Get('by-instructor/:instructorId')
  async getCoursesByInstructor(
    @Param('instructorId') instructorId: string,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    const [courses, total] = await this.courseService.getCoursesByInstructor(
      instructorId,
      Number(limit),
      Number(offset),
    );
    return {
      data: courses.map((c) => this.mapCourseToResponse(c)),
      total,
      limit: Number(limit),
      offset: Number(offset),
    };
  }

  @Patch(':id')
  async updateCourseDetails(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    const course = await this.courseService.updateCourseDetails(id, dto);
    return {
      id: course.id,
      title: course.title,
      status: course.status,
      message: 'Course updated successfully',
    };
  }

  // ==========================================
  // Original Endpoints (Updated)
  // ==========================================

  @Post()
  async createCourse(@Body() dto: CreateCourseDto) {
    const course = await this.courseService.createCourse(dto);
    return {
      id: course.id,
      title: course.title,
      is_active: course.is_active,
      message: 'Course created successfully',
    };
  }

  @Get()
  async getAllCourses(
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
    @Query('status') status?: CourseStatus,
  ) {
    const [courses, total] = await this.courseService.getAllCourses(
      Number(limit),
      Number(offset),
      status,
    );
    return {
      data: courses.map((c) => this.mapCourseToResponse(c)),
      total,
      limit: Number(limit),
      offset: Number(offset),
    };
  }

  @Get(':id')
  async getCourse(@Param('id') id: string) {
    const course = await this.courseService.getCourseById(id);
    return this.mapCourseToResponse(course);
  }

  // Helper method to map course entity to response
  private mapCourseToResponse(course: any) {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail_url: course.thumbnail_url,
      video_url: course.video_url,
      status: course.status,
      price: course.price,
      students_enrolled: course.students_enrolled,
      instructor_id: course.instructor_id,
      instructor_name: course.instructor_name,
      tags: course.tags,
      is_onsite: course.is_onsite,
      onsite_seats: course.onsite_seats,
      onsite_days: course.onsite_days,
      onsite_time_start: course.onsite_time_start,
      onsite_time_end: course.onsite_time_end,
      onsite_duration: course.onsite_duration,
      onsite_exam_schedule: course.onsite_exam_schedule,
      is_online: course.is_online,
      online_expiry: course.online_expiry,
      rejection_reason: course.rejection_reason,
      is_active: course.is_active,
      created_at: course.created_at,
      updated_at: course.updated_at,
      instructor: course.instructor ? {
        id: course.instructor.id,
        full_name: course.instructor.full_name,
        email: course.instructor.email,
      } : null,
    };
  }

  @Put(':id')
  async updateCourse(
    @Param('id') id: string,
    @Body() dto: Partial<CreateCourseDto>,
  ) {
    const course = await this.courseService.updateCourse(id, dto);
    return {
      id: course.id,
      title: course.title,
      message: 'Course updated successfully',
    };
  }

  @Post(':id/activate')
  async activateCourse(@Param('id') id: string) {
    const course = await this.courseService.activateCourse(id);
    return { is_active: course.is_active, message: 'Course activated' };
  }

  @Post(':id/deactivate')
  async deactivateCourse(@Param('id') id: string) {
    const course = await this.courseService.deactivateCourse(id);
    return { is_active: course.is_active, message: 'Course deactivated' };
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteCourse(@Param('id') id: string) {
    await this.courseService.deleteCourse(id);
    return { message: 'Course deleted successfully' };
  }

  // Lessons endpoints
  @Post(':courseId/lessons')
  async createLesson(
    @Param('courseId') courseId: string,
    @Body() dto: CreateLessonDto,
  ) {
    const lesson = await this.courseService.createLesson({
      ...dto,
      course_id: courseId,
    });
    return {
      id: lesson.id,
      topic_name: lesson.topic_name,
      message: 'Lesson created successfully',
    };
  }

  @Get(':courseId/lessons')
  async getLessonsByCourse(
    @Param('courseId') courseId: string,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    const [lessons, total] = await this.courseService.getLessonsByCourse(
      courseId,
      Number(limit),
      Number(offset),
    );
    return {
      data: lessons.map((l) => ({
        id: l.id,
        topic_name: l.topic_name,
        content: l.content,
        video_url: l.video_url,
        pdf_url: l.pdf_url,
        sequence_order: l.sequence_order,
      })),
      total,
      course_id: courseId,
    };
  }

  @Get('lessons/:lessonId')
  async getLesson(@Param('lessonId') lessonId: string) {
    const lesson = await this.courseService.getLessonById(lessonId);
    return {
      id: lesson.id,
      course_id: lesson.course_id,
      topic_name: lesson.topic_name,
      content: lesson.content,
      video_url: lesson.video_url,
      sequence_order: lesson.sequence_order,
    };
  }

  @Put('lessons/:lessonId')
  async updateLesson(
    @Param('lessonId') lessonId: string,
    @Body() dto: Partial<CreateLessonDto>,
  ) {
    const lesson = await this.courseService.updateLesson(lessonId, dto);
    return {
      id: lesson.id,
      topic_name: lesson.topic_name,
      message: 'Lesson updated successfully',
    };
  }
}
