import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { NotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async getUserIdFromToken(token: string): Promise<number | null> {
    const user = await this.authService.getUserFromToken(token);
    return user ? user.id : null;
  }

  async isAdmin(userId: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    
    return user?.role === 'ADMIN';
  }

  createEventNotification(eventId: number, title: string): NotificationDto {
    return {
      type: 'event',
      title,
      message: 'A new event has been created',
      data: { eventId },
      timestamp: new Date(),
    };
  }

  createPostNotification(postId: number, title: string): NotificationDto {
    return {
      type: 'post',
      title,
      message: 'A new post has been published',
      data: { postId },
      timestamp: new Date(),
    };
  }

  createCommentNotification(postId: number, commentId: number): NotificationDto {
    return {
      type: 'comment',
      title: 'New Comment',
      message: 'Someone commented on your post',
      data: { postId, commentId },
      timestamp: new Date(),
    };
  }

  createClubNotification(clubId: number, action: string): NotificationDto {
    return {
      type: 'club',
      title: 'Club Update',
      message: `Club ${action}`,
      data: { clubId },
      timestamp: new Date(),
    };
  }
}