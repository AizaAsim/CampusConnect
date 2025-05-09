import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Status } from '@prisma/client';

interface OverviewStatistics {
  totalUsers: number;
  totalClubs: number;
  totalEvents: number;
  totalPosts: number;
  upcomingEvents: number;
  activeClubs: number;
  postsLastWeek: number;
  eventsLastWeek: number;
  eventsPerCategory?: { category: string; count: number }[];
}

interface UserStatistics {
  user: {
    id: number;
    username: string;
    fullName: string;
    role: string;
  };
  clubCount: number;
  clubAdminCount: number;
  eventCount: number;
  eventOrganizedCount: number;
  postCount: number;
  commentCount: number;
  upcomingEvents: {
    id: number;
    title: string;
    dateTime: Date;
    status: Status;
  }[];
  recentActivity: {
    type: 'post' | 'comment' | 'event' | 'club' | 'attendance';
    id: number;
    title: string;
    createdAt: Date;
  }[];
}

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getOverviewStatistics(): Promise<OverviewStatistics> {
    const now = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    // Count all entities
    const totalUsers = await this.prisma.user.count();
    const totalClubs = await this.prisma.club.count();
    const totalEvents = await this.prisma.event.count();
    const totalPosts = await this.prisma.post.count();

    // Count upcoming events
    const upcomingEvents = await this.prisma.event.count({
      where: {
        dateTime: {
          gte: now,
        },
      },
    });

    // Count active clubs (clubs with events in the last month)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const activeClubs = await this.prisma.club.count({
      where: {
        events: {
          some: {
            dateTime: {
              gte: lastMonth,
            },
          },
        },
      },
    });

    // Count recent posts and events
    const postsLastWeek = await this.prisma.post.count({
      where: {
        createdAt: {
          gte: lastWeek,
        },
      },
    });

    const eventsLastWeek = await this.prisma.event.count({
      where: {
        createdAt: {
          gte: lastWeek,
        },
      },
    });

    // Get event distribution by club category
    const clubs = await this.prisma.club.findMany({
      select: {
        category: true,
        _count: {
          select: { events: true },
        },
      },
    });

    const eventsPerCategory = clubs
      .filter(club => club.category)
      .reduce((acc, club) => {
        const category = club.category || 'Uncategorized';
        const existingCategory = acc.find(c => c.category === category);
        
        if (existingCategory) {
          existingCategory.count += club._count.events;
        } else {
          acc.push({ category, count: club._count.events });
        }
        
        return acc;
      }, [] as { category: string; count: number }[])
      .sort((a, b) => b.count - a.count);

    return {
      totalUsers,
      totalClubs,
      totalEvents,
      totalPosts,
      upcomingEvents,
      activeClubs,
      postsLastWeek,
      eventsLastWeek,
      eventsPerCategory,
    };
  }

  async getUserStatistics(userId: number): Promise<UserStatistics> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get user club counts
    const clubCount = await this.prisma.clubMember.count({
      where: { userId },
    });

    const clubAdminCount = await this.prisma.club.count({
      where: { adminId: userId },
    });

    // Get user event counts
    const eventCount = await this.prisma.eventAttendee.count({
      where: { userId },
    });

    const eventOrganizedCount = await this.prisma.event.count({
      where: { organizerId: userId },
    });

    // Get user post and comment counts
    const postCount = await this.prisma.post.count({
      where: { authorId: userId },
    });

    const commentCount = await this.prisma.comment.count({
      where: { authorId: userId },
    });

    // Get upcoming events for the user
    const now = new Date();
    const upcomingEvents = await this.prisma.eventAttendee.findMany({
      where: {
        userId,
        event: {
          dateTime: {
            gte: now,
          },
        },
      },
      select: {
        event: {
          select: {
            id: true,
            title: true,
            dateTime: true,
          },
        },
        status: true,
      },
      orderBy: {
        event: {
          dateTime: 'asc',
        },
      },
      take: 5,
    });

    // Get recent activity
    const recentPosts = await this.prisma.post.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
    });

    const recentComments = await this.prisma.comment.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        post: {
          select: {
            title: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
    });

    const recentEventAttendance = await this.prisma.eventAttendee.findMany({
      where: { userId },
      select: {
        id: true,
        event: {
          select: {
            title: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
    });

    // Combine and sort recent activity
    const recentActivity = [
      ...recentPosts.map(post => ({
        type: 'post' as const,
        id: post.id,
        title: post.title,
        createdAt: post.createdAt,
      })),
      ...recentComments.map(comment => ({
        type: 'comment' as const,
        id: comment.id,
        title: `Comment on ${comment.post.title}`,
        createdAt: comment.createdAt,
      })),
      ...recentEventAttendance.map(attendance => ({
        type: 'attendance' as const,
        id: attendance.id,
        title: `Attending ${attendance.event.title}`,
        createdAt: attendance.createdAt,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);

    return {
      user,
      clubCount,
      clubAdminCount,
      eventCount,
      eventOrganizedCount,
      postCount,
      commentCount,
      upcomingEvents: upcomingEvents.map(attendance => ({
        id: attendance.event.id,
        title: attendance.event.title,
        dateTime: attendance.event.dateTime,
        status: attendance.status,
      })),
      recentActivity,
    };
  }
}