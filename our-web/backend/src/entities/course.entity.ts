import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Schedule } from './schedule.entity';
import { Lesson } from './lesson.entity';
import { Exam } from './exam.entity';
import { User } from './user.entity';

export enum CourseStatus {
  REQUEST_CREATE = 'REQUEST_CREATE',
  DRAFTING = 'DRAFTING',
  PENDING_REVIEW = 'PENDING_REVIEW',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
}

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  HARD = 'hard',
}

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  thumbnail_url: string;

  @Column({ type: 'text', nullable: true })
  video_url: string;

  @Column({ type: 'enum', enum: CourseStatus, default: CourseStatus.REQUEST_CREATE })
  status: CourseStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'enum', enum: CourseLevel, nullable: true })
  level: CourseLevel;

  @Column({ type: 'int', default: 0 })
  students_enrolled: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  instructor_name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  tags: string;

  // Onsite course options
  @Column({ type: 'boolean', default: false })
  is_onsite: boolean;

  @Column({ type: 'int', nullable: true })
  onsite_seats: number;

  @Column({ type: 'simple-array', nullable: true })
  onsite_days: string[];

  @Column({ type: 'time', nullable: true })
  onsite_time_start: string;

  @Column({ type: 'time', nullable: true })
  onsite_time_end: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  onsite_duration: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  onsite_exam_schedule: string;

  // Online course options
  @Column({ type: 'boolean', default: false })
  is_online: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  online_expiry: string;

  @Column({ type: 'text', nullable: true })
  rejection_reason: string;

  @Column({ type: 'uuid', nullable: true })
  instructor_id: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'instructor_id' })
  instructor: User;

  @OneToMany(() => Schedule, (schedule) => schedule.course)
  schedules: Schedule[];

  @OneToMany(() => Lesson, (lesson) => lesson.course)
  lessons: Lesson[];

  @OneToMany(() => Exam, (exam) => exam.course)
  exams: Exam[];
}
