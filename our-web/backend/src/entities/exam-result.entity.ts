import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Exam } from './exam.entity';

@Entity('exam_results')
export class ExamResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  exam_id: string;

  @Column({ type: 'integer', default: 0 })
  total_score: number;

  @Column({ type: 'float', default: 0 })
  percentage: number;

  @Column({ type: 'text', nullable: true })
  weak_points_log: string; // JSON array of lesson_ids where student got wrong

  @Column({ type: 'integer', default: 0 })
  total_questions: number;

  @Column({ type: 'integer', default: 0 })
  correct_answers: number;

  @Column({ type: 'integer', default: 0 })
  wrong_answers: number;

  @Column({ type: 'integer', nullable: true })
  time_spent_seconds: number;

  @Column({ type: 'timestamp', nullable: true })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.exam_results, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Exam, (exam) => exam.results, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exam_id' })
  exam: Exam;
}
