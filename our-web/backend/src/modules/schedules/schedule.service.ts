import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from '../../entities/schedule.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepo: Repository<Schedule>,
  ) {}

  async getSchedulesByCourse(courseId: string): Promise<Schedule[]> {
    // simply return all schedules for a given course
    return this.scheduleRepo.find({
      where: { course_id: courseId },
      order: { start_time: 'ASC' },
    });
  }

  async getScheduleById(id: string): Promise<Schedule> {
    const sch = await this.scheduleRepo.findOne({ where: { id } });
    if (!sch) {
      throw new NotFoundException('Schedule not found');
    }
    return sch;
  }
}
