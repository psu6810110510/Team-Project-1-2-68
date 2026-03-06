import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../../entities/booking.entity';
import { Schedule } from '../../entities/schedule.entity';
import { User } from '../../entities/user.entity';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { SeatQuota } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Schedule, User,SeatQuota])],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
