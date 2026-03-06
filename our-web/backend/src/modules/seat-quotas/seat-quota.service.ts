import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeatQuota, LearningMode } from '../../entities/seat-quota.entity';
import { Schedule } from '../../entities/schedule.entity';

export interface CreateSeatQuotaDto {
  schedule_id: string;
  learning_mode: LearningMode;
  quota: number;
}

export interface UpdateSeatQuotaDto {
  quota?: number;
}

@Injectable()
export class SeatQuotaService {
  constructor(
    @InjectRepository(SeatQuota) private seatQuotaRepo: Repository<SeatQuota>,
    @InjectRepository(Schedule) private scheduleRepo: Repository<Schedule>,
  ) {}

  async createSeatQuota(dto: CreateSeatQuotaDto): Promise<SeatQuota> {
    // Verify schedule exists
    const schedule = await this.scheduleRepo.findOne({
      where: { id: dto.schedule_id },
    });
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    // Check if quota already exists for this schedule and learning mode
    const existingQuota = await this.seatQuotaRepo.findOne({
      where: { schedule_id: dto.schedule_id, learning_mode: dto.learning_mode },
    });
    if (existingQuota) {
      throw new ConflictException(
        'Seat quota already exists for this schedule and learning mode',
      );
    }

    const result = await this.seatQuotaRepo.insert({
      schedule_id: dto.schedule_id,
      learning_mode: dto.learning_mode,
      quota: dto.quota,
    });

    const quota = await this.seatQuotaRepo.findOne({
      where: { id: result.identifiers[0].id },
    });
    if (!quota) {
      throw new NotFoundException('Failed to create seat quota');
    }
    return quota;
  }

  async getSeatQuotasBySchedule(scheduleId: string): Promise<SeatQuota[]> {
    return this.seatQuotaRepo.find({
      where: { schedule_id: scheduleId },
      relations: ['schedule'],
    });
  }

  async getSeatQuotaById(id: string): Promise<SeatQuota> {
    const quota = await this.seatQuotaRepo.findOne({
      where: { id },
      relations: ['schedule'],
    });
    if (!quota) {
      throw new NotFoundException('Seat quota not found');
    }
    return quota;
  }

  async updateSeatQuota(
    id: string,
    dto: UpdateSeatQuotaDto,
  ): Promise<SeatQuota> {
    const quota = await this.getSeatQuotaById(id);

    await this.seatQuotaRepo.update(id, dto);

    const updatedQuota = await this.seatQuotaRepo.findOne({ where: { id } });
    if (!updatedQuota) {
      throw new NotFoundException('Seat quota not found after update');
    }
    return updatedQuota;
  }

  async deleteSeatQuota(id: string): Promise<void> {
    const quota = await this.getSeatQuotaById(id);
    await this.seatQuotaRepo.delete(id);
  }

  async getAvailableSeats(
    scheduleId: string,
    learningMode: LearningMode,
  ): Promise<number> {
    const quota = await this.seatQuotaRepo.findOne({
      where: { schedule_id: scheduleId, learning_mode: learningMode },
    });

    if (!quota) {
      return 0; // No quota set
    }

    // Count current bookings for this schedule and learning mode
    const bookingCount = await this.seatQuotaRepo
      .createQueryBuilder('sq')
      .leftJoin('sq.schedule', 'schedule')
      .leftJoin(
        'schedule.bookings',
        'booking',
        'booking.learning_mode = :learningMode AND booking.status != :cancelled',
        {
          learningMode,
          cancelled: 'CANCELLED',
        },
      )
      .where('sq.schedule_id = :scheduleId', { scheduleId })
      .andWhere('sq.learning_mode = :learningMode', { learningMode })
      .select('COUNT(booking.id)', 'count')
      .getRawOne();

    const bookedSeats = parseInt(bookingCount.count) || 0;
    return Math.max(0, quota.quota - bookedSeats);
  }
}
