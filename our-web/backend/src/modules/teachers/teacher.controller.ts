import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { Teacher } from '../entities/teacher.entity';

@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  async createTeacher(@Body() data: Partial<Teacher>): Promise<Teacher> {
    return this.teacherService.createTeacher(data);
  }

  @Get()
  async getAllTeachers(): Promise<Teacher[]> {
    return this.teacherService.getAllTeachers();
  }

  @Get(':id')
  async getTeacherById(@Param('id') id: number): Promise<Teacher> {
    return this.teacherService.getTeacherById(id);
  }

  @Put(':id')
  async updateTeacher(
    @Param('id') id: number,
    @Body() data: Partial<Teacher>,
  ): Promise<Teacher> {
    return this.teacherService.updateTeacher(id, data);
  }

  @Delete(':id')
  async deleteTeacher(@Param('id') id: number): Promise<void> {
    return this.teacherService.deleteTeacher(id);
  }
}