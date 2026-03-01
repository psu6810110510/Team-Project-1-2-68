import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { CourseService } from './course.service';
import type { CreateCourseDto, CreateLessonDto } from './course.service';

@Controller('courses')
export class CourseController {
  constructor(private courseService: CourseService) {}

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
  async getAllCourses(@Query('limit') limit = 10, @Query('offset') offset = 0) {
    const [courses, total] = await this.courseService.getAllCourses(
      Number(limit),
      Number(offset),
    );
    return {
      data: courses.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        thumbnail_url: c.thumbnail_url,
        is_active: c.is_active,
        created_at: c.created_at,
      })),
      total,
      limit: Number(limit),
      offset: Number(offset),
    };
  }

  @Get(':id')
  async getCourse(@Param('id') id: string) {
    const course = await this.courseService.getCourseById(id);
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail_url: course.thumbnail_url,
      is_active: course.is_active,
      created_at: course.created_at,
    };
  }

  @Put(':id')
  async updateCourse(@Param('id') id: string, @Body() dto: Partial<CreateCourseDto>) {
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

  // Lessons endpoints
  @Post(':courseId/lessons')
  async createLesson(@Param('courseId') courseId: string, @Body() dto: CreateLessonDto) {
    const lesson = await this.courseService.createLesson({ ...dto, course_id: courseId });
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
        video_url: l.video_url,
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
  async updateLesson(@Param('lessonId') lessonId: string, @Body() dto: Partial<CreateLessonDto>) {
    const lesson = await this.courseService.updateLesson(lessonId, dto);
    return {
      id: lesson.id,
      topic_name: lesson.topic_name,
      message: 'Lesson updated successfully',
    };
  }
}
