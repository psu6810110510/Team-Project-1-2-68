import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { Review, Course } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Course])],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
