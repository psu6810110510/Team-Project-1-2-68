import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from '../../entities/payment.entity';
import { Course } from '../../entities/course.entity';

export interface CreatePaymentDto {
  user_id: string;
  user_name?: string;
  user_email?: string;
  course_ids: string[];
  course_titles: string[];
  course_prices?: number[];
  total_amount: number;
}

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Course) private courseRepo: Repository<Course>,
  ) {}

  async createPayment(dto: CreatePaymentDto): Promise<Payment> {
    const result = await this.paymentRepo.insert({
      user_id: dto.user_id,
      user_name: dto.user_name || '',
      user_email: dto.user_email || '',
      course_ids: dto.course_ids,
      course_titles: dto.course_titles,
      course_prices: dto.course_prices || [],
      total_amount: dto.total_amount,
      status: PaymentStatus.PENDING_PAYMENT,
    });

    return (await this.paymentRepo.findOne({
      where: { id: result.identifiers[0].id },
    }))!;
  }

  async submitPayment(id: string, slipUrl?: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    payment.status = PaymentStatus.PAYMENT_SUBMITTED;
    if (slipUrl) payment.slip_url = slipUrl;
    return this.paymentRepo.save(payment);
  }

  async getAllPayments(): Promise<Payment[]> {
    return this.paymentRepo.find({ order: { created_at: 'DESC' } });
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    return this.paymentRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async confirmPayment(id: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    
    // If already confirmed, don't increment again
    if (payment.status === PaymentStatus.CONFIRMED) {
      return payment;
    }

    payment.status = PaymentStatus.CONFIRMED;
    const savedPayment = await this.paymentRepo.save(payment);

    // Increment student count for each course
    try {
      if (payment.course_ids && payment.course_ids.length > 0) {
        for (const courseId of payment.course_ids) {
          await this.courseRepo.increment({ id: courseId }, 'students_enrolled', 1);
          console.log(`📈 Incremented enrollment for course ${courseId}`);
        }
      }
    } catch (error) {
      console.error('Failed to increment course enrollment:', error);
      // We don't throw here to avoid failing the payment confirmation if just the counter fails
    }

    return savedPayment;
  }

  async rejectPayment(id: string, reason?: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    payment.status = PaymentStatus.REJECTED;
    payment.reject_reason = reason || '';
    return this.paymentRepo.save(payment);
  }

  async checkCourseAccess(userId: string, courseId: string): Promise<boolean> {
    const payments = await this.paymentRepo.find({
      where: { user_id: userId, status: PaymentStatus.CONFIRMED },
    });
    return payments.some((p) => p.course_ids.includes(courseId));
  }
}
