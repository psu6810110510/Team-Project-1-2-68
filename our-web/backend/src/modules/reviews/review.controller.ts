import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('courses')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get(':courseId/reviews')
  async getReviews(@Param('courseId') courseId: string) {
    const reviews = await this.reviewService.getReviewsByCourse(courseId);
    return reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      user: {
        id: r.user?.id,
        full_name: r.user?.full_name,
        image: r.user?.image,
      }
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Post(':courseId/reviews')
  async createReview(
    @Request() req,
    @Param('courseId') courseId: string,
    @Body() body: { rating: number; comment: string },
  ) {
    const userId = req.user.userId || req.user.sub || req.user.id;
    return this.reviewService.createReview(courseId, userId, body.rating, body.comment);
  }
}
