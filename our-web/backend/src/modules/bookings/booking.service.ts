import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus, LearningMode } from '../../entities/booking.entity';
import { Schedule } from '../../entities/schedule.entity';
import { User } from '../../entities/user.entity';

export interface CreateBookingDto {
  user_id: string;
  schedule_id: string;
  learning_mode: LearningMode;
  notes?: string;
}

export interface UpdateBookingDto {
  status?: BookingStatus;
  learning_mode?: LearningMode;
  notes?: string;
}

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
    @InjectRepository(Schedule) private scheduleRepo: Repository<Schedule>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async createBooking(dto: CreateBookingDto): Promise<Booking> {
    // Verify user exists
    const user = await this.userRepo.findOne({ where: { id: dto.user_id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify schedule exists
    const schedule = await this.scheduleRepo.findOne({ where: { id: dto.schedule_id } });
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    // Check if user already booked this schedule
    const existingBooking = await this.bookingRepo.findOne({
      where: {
        user_id: dto.user_id,
        schedule_id: dto.schedule_id,
      },
    });

    if (existingBooking) {
      throw new ConflictException('User already booked this schedule');
    }

    // Check seat availability for onsite
    if (dto.learning_mode === LearningMode.ONSITE && schedule.max_onsite_seats) {
      const onsiteBookings = await this.bookingRepo.count({
        where: {
          schedule_id: dto.schedule_id,
          learning_mode: LearningMode.ONSITE,
          status: BookingStatus.CONFIRMED,
        },
      });

      if (onsiteBookings >= schedule.max_onsite_seats) {
        throw new ConflictException('No available seats for onsite booking');
      }
    }

    const result = await this.bookingRepo.insert({
      user_id: dto.user_id,
      schedule_id: dto.schedule_id,
      learning_mode: dto.learning_mode,
      status: BookingStatus.PENDING,
      booking_date: new Date(),
      notes: dto.notes || undefined,
    });

    return (await this.bookingRepo.findOne({ where: { id: result.identifiers[0].id } }))!;
  }

  async getBookingById(id: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    // Verify user exists
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.bookingRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async getBookingsBySchedule(scheduleId: string): Promise<Booking[]> {
    // Verify schedule exists
    const schedule = await this.scheduleRepo.findOne({ where: { id: scheduleId } });
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return this.bookingRepo.find({
      where: { schedule_id: scheduleId },
      order: { created_at: 'DESC' },
    });
  }

  async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
    const booking = await this.getBookingById(id);
    booking.status = status;
    return this.bookingRepo.save(booking);
  }

  async cancelBooking(id: string): Promise<Booking> {
    const booking = await this.getBookingById(id);
    booking.status = BookingStatus.CANCELLED;
    return this.bookingRepo.save(booking);
  }

  async confirmBooking(id: string): Promise<Booking> {
    return this.updateBookingStatus(id, BookingStatus.CONFIRMED);
  }

  async getBookingStats(scheduleId: string) {
    const schedule = await this.scheduleRepo.findOne({ where: { id: scheduleId } });
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    const total = await this.bookingRepo.count({ where: { schedule_id: scheduleId } });
    const confirmed = await this.bookingRepo.count({
      where: { schedule_id: scheduleId, status: BookingStatus.CONFIRMED },
    });
    const onsite = await this.bookingRepo.count({
      where: { schedule_id: scheduleId, learning_mode: LearningMode.ONSITE },
    });
    const online = await this.bookingRepo.count({
      where: { schedule_id: scheduleId, learning_mode: LearningMode.ONLINE },
    });

    return {
      total,
      confirmed,
      pending: total - confirmed,
      onsite,
      online,
      available_seats: schedule.max_onsite_seats
        ? Math.max(0, schedule.max_onsite_seats - onsite)
        : null,
    };
  }
}
