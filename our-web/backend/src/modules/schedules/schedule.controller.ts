import { Controller, Get, Param } from '@nestjs/common';
import { ScheduleService } from './schedule.service';

@Controller('schedules')
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  @Get('course/:courseId')
  async getByCourse(@Param('courseId') courseId: string) {
    const schedules = await this.scheduleService.getSchedulesByCourse(courseId);
    return { data: schedules };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const schedule = await this.scheduleService.getScheduleById(id);
    return schedule;
  }
}
