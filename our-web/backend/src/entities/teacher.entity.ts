import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
}