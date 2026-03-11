import { Controller, Get, Post, Body, Param, Put, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PaymentService } from './payment.service';
import type { CreatePaymentDto } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post()
  async createPayment(@Body() dto: CreatePaymentDto) {
    const payment = await this.paymentService.createPayment(dto);
    return {
      id: payment.id,
      status: payment.status,
      total_amount: payment.total_amount,
      message: 'Payment created successfully',
    };
  }

  @Post(':id/submit')
  @UseInterceptors(
    FileInterceptor('slip', {
      storage: diskStorage({
        destination: './uploads/slips',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `slip-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(new BadRequestException('รองรับเฉพาะไฟล์รูปภาพ: jpg, png, webp, gif'), false);
        }
        callback(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async submitPayment(@Param('id') id: string, @UploadedFile() file?: Express.Multer.File) {
    const slipUrl = file
      ? `${process.env.API_URL || 'http://localhost:3000'}/uploads/slips/${file.filename}`
      : undefined;
    const payment = await this.paymentService.submitPayment(id, slipUrl);
    return {
      id: payment.id,
      status: payment.status,
      slip_url: payment.slip_url,
      message: 'Payment submitted for review',
    };
  }

  @Get()
  async getAllPayments() {
    const payments = await this.paymentService.getAllPayments();
    return {
      data: payments.map((p) => ({
        id: p.id,
        user_id: p.user_id,
        user_name: p.user_name,
        user_email: p.user_email,
        course_ids: p.course_ids,
        course_titles: p.course_titles,
        course_prices: p.course_prices,
        total_amount: Number(p.total_amount),
        status: p.status,
        reject_reason: p.reject_reason,
        slip_url: p.slip_url,
        created_at: p.created_at,
      })),
      total: payments.length,
    };
  }

  @Get('user/:userId')
  async getUserPayments(@Param('userId') userId: string) {
    const payments = await this.paymentService.getUserPayments(userId);
    return {
      data: payments.map((p) => ({
        id: p.id,
        course_ids: p.course_ids,
        course_titles: p.course_titles,
        total_amount: Number(p.total_amount),
        status: p.status,
        created_at: p.created_at,
      })),
      total: payments.length,
      user_id: userId,
    };
  }

  @Get('user/:userId/course/:courseId/access')
  async checkCourseAccess(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
  ) {
    const hasAccess = await this.paymentService.checkCourseAccess(userId, courseId);
    return { has_access: hasAccess };
  }

  @Put(':id/confirm')
  async confirmPayment(@Param('id') id: string) {
    const payment = await this.paymentService.confirmPayment(id);
    return {
      id: payment.id,
      status: payment.status,
      message: 'Payment confirmed. Student now has access to the course(s).',
    };
  }

  @Put(':id/reject')
  async rejectPayment(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    const payment = await this.paymentService.rejectPayment(id, body.reason);
    return {
      id: payment.id,
      status: payment.status,
      message: 'Payment rejected',
    };
  }
}
