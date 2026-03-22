import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column('text')
  bachelorDegree: string;

  @Column('text', { nullable: true })
  masterDegree?: string;

  @Column('text', { nullable: true })
  doctorateDegree?: string;

  @Column('text')
  expertise: string;

  @Column('text', { nullable: true })
  profileImage?: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'boolean', default: false })
  is_approved: boolean;
}