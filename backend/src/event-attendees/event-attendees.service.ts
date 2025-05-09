import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventAttendee } from '@prisma/client';
import { CreateEventAttendeeDto } from './dto/create-event-attendee.dto';
import { UpdateEventAttendeeDto } from './dto/update-event-attendee.dto';

@Injectable()
export class EventAttendeesService {
  constructor(private prisma: PrismaService) {}

  async create(createEventAttendeeDto: CreateEventAttendeeDto): Promise<EventAttendee> {
    // Check if event exists
    const event = await this.prisma.event.findUnique({
      where: { id: createEventAttendeeDto.eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${createEventAttendeeDto.eventId} not found`);
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: createEventAttendeeDto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${createEventAttendeeDto.userId} not found`);
    }

    // Check if attendance already exists
    const existingAttendee = await this.prisma.eventAttendee.findFirst({
      where: {
        eventId: createEventAttendeeDto.eventId,
        userId: createEventAttendeeDto.userId,
      },
    });

    if (existingAttendee) {
      throw new ConflictException('User is already registered for this event');
    }

    return this.prisma.eventAttendee.create({
      data: createEventAttendeeDto,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
        event: true,
      },
    });
  }

  async findByEvent(eventId: number): Promise<EventAttendee[]> {
    // Check if event exists
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return this.prisma.eventAttendee.findMany({
      where: { eventId },
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
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findByUser(userId: number): Promise<EventAttendee[]> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.prisma.eventAttendee.findMany({
      where: { userId },
      include: {
        event: {
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
        },
      },
      orderBy: {
        event: {
          dateTime: 'asc',
        },
      },
    });
  }

  async update(
    eventId: number,
    userId: number,
    updateEventAttendeeDto: UpdateEventAttendeeDto,
  ): Promise<EventAttendee> {
    // Find the attendance record
    const attendee = await this.prisma.eventAttendee.findFirst({
      where: {
        eventId,
        userId,
      },
    });

    if (!attendee) {
      throw new NotFoundException(`Event attendance record not found`);
    }

    return this.prisma.eventAttendee.update({
      where: {
        id: attendee.id,
      },
      data: updateEventAttendeeDto,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
        event: true,
      },
    });
  }

  async remove(eventId: number, userId: number): Promise<EventAttendee> {
    // Find the attendance record
    const attendee = await this.prisma.eventAttendee.findFirst({
      where: {
        eventId,
        userId,
      },
    });

    if (!attendee) {
      throw new NotFoundException(`Event attendance record not found`);
    }

    return this.prisma.eventAttendee.delete({
      where: {
        id: attendee.id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
        event: true,
      },
    });
  }
}