import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../../entities/review.entity';
import { Course } from '../../entities/course.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(Course) private courseRepo: Repository<Course>,
  ) {}

  async getReviewsByCourse(courseId: string): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { course_id: courseId },
      relations: ['user'], // Loaded to get reviewer's name/picture
      order: { created_at: 'DESC' },
    });
  }

  async createReview(courseId: string, userId: string, rating: number, comment: string): Promise<Review> {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const review = this.reviewRepo.create({
      course_id: courseId,
      user_id: userId,
      rating,
      comment,
    });

    return this.reviewRepo.save(review);
  }
}
