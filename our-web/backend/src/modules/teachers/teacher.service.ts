import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from '../../entities/teacher.entity';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    private readonly notificationService: NotificationService,
  ) { }

  async createTeacher(data: Partial<Teacher>): Promise<Teacher> {
    const teacher = this.teacherRepository.create(data);
    return this.teacherRepository.save(teacher);
  }

  async getAllTeachers(): Promise<Teacher[]> {
    return this.teacherRepository.find();
  }

  // ✅ แก้ไขตรงนี้: เพิ่มการดักจับกรณีหาข้อมูลไม่เจอ (null)
  async getTeacherById(id: number): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({ where: { id } });

    if (!teacher) {
      throw new NotFoundException(`ไม่พบข้อมูลอาจารย์รหัส ${id}`);
    }

    return teacher;
  }

  async updateTeacher(id: number, data: Partial<Teacher>): Promise<Teacher> {
    await this.teacherRepository.update(id, data);
    return this.getTeacherById(id);
  }

  async deleteTeacher(id: number): Promise<void> {
    await this.teacherRepository.delete(id);
  }

  async approveTeacher(id: number): Promise<Teacher> {
    const teacher = await this.getTeacherById(id);
    teacher.is_approved = true;
    await this.teacherRepository.save(teacher);

    if (teacher.user_id) {
      await this.notificationService.createNotification(
        teacher.user_id,
        `ยินดีด้วย! บัญชีอาจารย์ของคุณได้รับการอนุมัติแล้ว สามารถขอเปิดคอร์สใหม่ได้แล้วครับ`
      );
    }

    return teacher;
  }
}