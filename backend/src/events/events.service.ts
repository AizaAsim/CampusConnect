import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Event, User, Role } from '@prisma/client';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    // If clubId is provided, check if club exists
    if (createEventDto.clubId) {
      const club = await this.prisma.club.findUnique({
        where: { id: createEventDto.clubId },
      });

      if (!club) {
        throw new NotFoundException(`Club with ID ${createEventDto.clubId} not found`);
      }
    }

    const event = await this.prisma.event.create({
      data: {
        ...createEventDto,
        dateTime: new Date(createEventDto.dateTime),
      },
      include: {
        organizer: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
        club: true,
      },
    });

    // Send notification to club members if the event is associated with a club
    if (event.clubId) {
      const clubMembers = await this.prisma.clubMember.findMany({
        where: { clubId: event.clubId },
      });

      const notification = this.notificationsService.createEventNotification(
        event.id,
        event.title,
      );

      // Notify all club members
      clubMembers.forEach(member => {
        this.notificationsGateway.sendToUser(member.userId, 'notification', notification);
      });
    }

    return event;
  }

  async findAll(): Promise<Event[]> {
    return this.prisma.event.findMany({
      include: {
        organizer: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
        club: true,
        _count: {
          select: { attendees: true },
        },
      },
      orderBy: {
        dateTime: 'asc',
      },
    });
  }

  async findFuture(): Promise<Event[]> {
    return this.prisma.event.findMany({
      where: {
        dateTime: {
          gte: new Date(),
        },
      },
      include: {
        organizer: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
        club: true,
        _count: {
          select: { attendees: true },
        },
      },
      orderBy: {
        dateTime: 'asc',
      },
    });
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
        club: true,
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async findByClub(clubId: number): Promise<Event[]> {
    // Check if club exists
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club) {
      throw new NotFoundException(`Club with ID ${clubId} not found`);
    }

    return this.prisma.event.findMany({
      where: { clubId },
      include: {
        organizer: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
        _count: {
          select: { attendees: true },
        },
      },
      orderBy: {
        dateTime: 'asc',
      },
    });
  }

  async update(id: number, updateEventDto: UpdateEventDto, user: User): Promise<Event> {
    // Find the event first
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        club: true,
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Check if user is the organizer, club admin, or a system admin
    const isOrganizer = event.organizerId === user.id;
    const isClubAdmin = event.clubId && event.club.adminId === user.id;
    const isAdmin = user.role === Role.ADMIN;

    if (!isOrganizer && !isClubAdmin && !isAdmin) {
      throw new ForbiddenException('You do not have permission to update this event');
    }

    // If updating clubId, check if new club exists
    if (updateEventDto.clubId) {
      const club = await this.prisma.club.findUnique({
        where: { id: updateEventDto.clubId },
      });

      if (!club) {
        throw new NotFoundException(`Club with ID ${updateEventDto.clubId} not found`);
      }
    }

    // Process the date if it's provided
    const data: any = { ...updateEventDto };
    if (updateEventDto.dateTime) {
      data.dateTime = new Date(updateEventDto.dateTime);
    }

    return this.prisma.event.update({
      where: { id },
      data,
      include: {
        organizer: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
        club: true,
      },
    });
  }

  async remove(id: number, user: User): Promise<Event> {
    // Find the event first
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        club: true,
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Check if user is the organizer, club admin, or a system admin
    const isOrganizer = event.organizerId === user.id;
    const isClubAdmin = event.clubId && event.club.adminId === user.id;
    const isAdmin = user.role === Role.ADMIN;

    if (!isOrganizer && !isClubAdmin && !isAdmin) {
      throw new ForbiddenException('You do not have permission to delete this event');
    }

    return this.prisma.event.delete({
      where: { id },
    });
  }
}