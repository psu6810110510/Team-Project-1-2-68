import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SeatQuotaService } from './seat-quota.service';
import type {
  CreateSeatQuotaDto,
  UpdateSeatQuotaDto,
} from './seat-quota.service';
import { LearningMode } from '../../entities/seat-quota.entity';

@Controller('seat-quotas')
export class SeatQuotaController {
  constructor(private readonly seatQuotaService: SeatQuotaService) {}

  @Post()
  async createSeatQuota(@Body() dto: CreateSeatQuotaDto) {
    return this.seatQuotaService.createSeatQuota(dto);
  }

  @Get('schedule/:scheduleId')
  async getSeatQuotasBySchedule(
    @Param('scheduleId', ParseUUIDPipe) scheduleId: string,
  ) {
    return this.seatQuotaService.getSeatQuotasBySchedule(scheduleId);
  }

  @Get(':id')
  async getSeatQuotaById(@Param('id', ParseUUIDPipe) id: string) {
    return this.seatQuotaService.getSeatQuotaById(id);
  }

  @Put(':id')
  async updateSeatQuota(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSeatQuotaDto,
  ) {
    return this.seatQuotaService.updateSeatQuota(id, dto);
  }

  @Delete(':id')
  async deleteSeatQuota(@Param('id', ParseUUIDPipe) id: string) {
    await this.seatQuotaService.deleteSeatQuota(id);
    return { message: 'Seat quota deleted successfully' };
  }

  @Get('available-seats/:scheduleId')
  async getAvailableSeats(
    @Param('scheduleId', ParseUUIDPipe) scheduleId: string,
    @Query('learningMode') learningMode: LearningMode,
  ) {
    const availableSeats = await this.seatQuotaService.getAvailableSeats(
      scheduleId,
      learningMode,
    );
    return { availableSeats };
  }
}
