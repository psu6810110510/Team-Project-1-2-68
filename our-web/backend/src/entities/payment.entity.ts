import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PaymentStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAYMENT_SUBMITTED = 'PAYMENT_SUBMITTED',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'text', nullable: true })
  user_name: string;

  @Column({ type: 'text', nullable: true })
  user_email: string;

  @Column({ type: 'jsonb' })
  course_ids: string[];

  @Column({ type: 'jsonb' })
  course_titles: string[];

  @Column({ type: 'jsonb', nullable: true })
  course_prices: number[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING_PAYMENT,
  })
  status: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  reject_reason: string;

  @Column({ type: 'text', nullable: true })
  slip_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
