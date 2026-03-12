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

  @Get()
  async getAllBookings() {
    const bookings = await this.bookingService.getAllBookings();
    return {
      data: bookings.map((b) => ({
        id: b.id,
        user_name: b.user?.full_name || 'ไม่ระบุ',
        user_email: b.user?.email || 'ไม่ระบุ',
        course_name: b.schedule?.course?.title || 'ไม่ระบุ',
        schedule_id: b.schedule_id,
        schedule_start_time: b.schedule?.start_time || null,
        schedule_end_time: b.schedule?.end_time || null,
        room_location: b.schedule?.room_location || null,
        learning_mode: b.learning_mode,
        status: b.status,
        booking_date: b.booking_date,
        created_at: b.created_at,
        notes: b.notes,
      })),
      total: bookings.length,
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
    const bookings =
      await this.bookingService.getBookingsBySchedule(scheduleId);
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

  @Get('course/:courseId/onsite-count')
  async getOnsiteBookedCount(@Param('courseId') courseId: string) {
    const count = await this.bookingService.getOnsiteBookedCountByCourse(courseId);
    return { count };
  }

  @Get('schedule/:scheduleId/stats')
  async getBookingStats(@Param('scheduleId') scheduleId: string) {
    return this.bookingService.getBookingStats(scheduleId);
  }
}
