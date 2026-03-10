import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from '../../entities/teacher.entity';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {}

  async createTeacher(data: Partial<Teacher>): Promise<Teacher> {
    const teacher = this.teacherRepository.create(data);
    return this.teacherRepository.save(teacher);
  }

  async getAllTeachers(): Promise<Teacher[]> {
    return this.teacherRepository.find();
  }

  async getTeacherById(id: number): Promise<Teacher | null> {
    return this.teacherRepository.findOne({ where: { id } });
  }

  async updateTeacher(id: number, data: Partial<Teacher>): Promise<Teacher | null> {
    await this.teacherRepository.update(id, data);
    return this.getTeacherById(id);
  }

  async deleteTeacher(id: number): Promise<void> {
    await this.teacherRepository.delete(id);
  }
}