import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { BookingService } from './booking.service';
import type { CreateBookingDto } from './booking.service';
import { BookingStatus } from '../../entities/booking.entity';

@Controller('bookings')
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Post()
  async createBooking(@Body() dto: CreateBookingDto) {
    const booking = await this.bookingService.createBooking(dto);
    return {
      id: booking.id,
      status: booking.status,
      learning_mode: booking.learning_mode,
      message: 'Booking created successfully',
    };
  }

  @Get(':id')
  async getBooking(@Param('id') id: string) {
    const booking = await this.bookingService.getBookingById(id);
    return {
      id: booking.id,
      user_id: booking.user_id,
      schedule_id: booking.schedule_id,
      learning_mode: booking.learning_mode,
      status: booking.status,
      booking_date: booking.booking_date,
      created_at: booking.created_at,
    };
  }

  @Get('user/:userId')
  async getBookingsByUser(@Param('userId') userId: string) {
    const bookings = await this.bookingService.getBookingsByUser(userId);
    return {
      data: bookings.map((b) => ({
        id: b.id,
        schedule_id: b.schedule_id,
        learning_mode: b.learning_mode,
        status: b.status,
        created_at: b.created_at,
      })),
      total: bookings.length,
      user_id: userId,
    };
  }

  @Get('schedule/:scheduleId')
  async getBookingsBySchedule(@Param('scheduleId') scheduleId: string) {
    const bookings = await this.bookingService.getBookingsBySchedule(scheduleId);
    return {
      data: bookings.map((b) => ({
        id: b.id,
        user_id: b.user_id,
        learning_mode: b.learning_mode,
        status: b.status,
      })),
      total: bookings.length,
      schedule_id: scheduleId,
    };
  }

  @Put(':id/confirm')
  async confirmBooking(@Param('id') id: string) {
    const booking = await this.bookingService.confirmBooking(id);
    return {
      id: booking.id,
      status: booking.status,
      message: 'Booking confirmed',
    };
  }

  @Put(':id/cancel')
  async cancelBooking(@Param('id') id: string) {
    const booking = await this.bookingService.cancelBooking(id);
    return {
      id: booking.id,
      status: booking.status,
      message: 'Booking cancelled',
    };
  }

  @Get('schedule/:scheduleId/stats')
  async getBookingStats(@Param('scheduleId') scheduleId: string) {
    return this.bookingService.getBookingStats(scheduleId);
  }
}
