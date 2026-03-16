import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(@Req() req: any) {
    const userId = req.user.id; // Or req.user.sub depending on JWT payload
    return this.notificationService.getNotificationsByUser(userId);
  }

  @Post(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }
}
