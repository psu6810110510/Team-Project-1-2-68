import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from '../../entities/teacher.entity';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher]), NotificationModule],
  controllers: [TeacherController],
  providers: [TeacherService],
})
export class TeacherModule { }