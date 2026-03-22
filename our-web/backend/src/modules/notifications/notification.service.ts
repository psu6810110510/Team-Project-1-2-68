import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async createNotification(userId: string, message: string): Promise<Notification> {
    const notification = this.notificationRepo.create({
      user_id: userId,
      message,
    });
    return this.notificationRepo.save(notification);
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return this.notificationRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    notification.is_read = true;
    return this.notificationRepo.save(notification);
  }
}
