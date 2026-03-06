import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Schedule } from './schedule.entity';

export enum LearningMode {
  ONLINE = 'ONLINE',
  ONSITE = 'ONSITE',
  HYBRID = 'HYBRID',
}

@Entity('seat_quotas')
export class SeatQuota {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  schedule_id: string;

  @Column({ type: 'enum', enum: LearningMode })
  learning_mode: LearningMode;

  @Column({ type: 'integer' })
  quota: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Schedule, (schedule) => schedule.seat_quotas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'schedule_id' })
  schedule: Schedule;
}
