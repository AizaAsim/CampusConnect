import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Club, User, Role } from '@prisma/client';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';

@Injectable()
export class ClubsService {
  constructor(private prisma: PrismaService) {}

  async create(createClubDto: CreateClubDto): Promise<Club> {
    return this.prisma.club.create({
      data: createClubDto,
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
      },
    });
  }

  async findAll(): Promise<Club[]> {
    return this.prisma.club.findMany({
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
        _count: {
          select: {
            members: true,
            events: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: number): Promise<Club> {
    const club = await this.prisma.club.findUnique({
      where: { id },
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
        members: {
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
        events: {
          include: {
            organizer: {
              select: {
                id: true,
                username: true,
                fullName: true,
                role: true,
              },
            },
          },
          orderBy: {
            dateTime: 'asc',
          },
        },
      },
    });

    if (!club) {
      throw new NotFoundException(`Club with ID ${id} not found`);
    }

    return club;
  }

  async findByUser(userId: number): Promise<Club[]> {
    // Find clubs where user is a member or admin
    const memberClubs = await this.prisma.club.findMany({
      where: {
        OR: [
          { adminId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
        _count: {
          select: {
            members: true,
            events: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return memberClubs;
  }

  async update(id: number, updateClubDto: UpdateClubDto, user: User): Promise<Club> {
    // Find the club first
    const club = await this.prisma.club.findUnique({
      where: { id },
    });

    if (!club) {
      throw new NotFoundException(`Club with ID ${id} not found`);
    }

    // Check if the user is the club admin or a system admin
    if (club.adminId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to update this club');
    }

    return this.prisma.club.update({
      where: { id },
      data: updateClubDto,
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
      },
    });
  }

  async remove(id: number, user: User): Promise<Club> {
    // Find the club first
    const club = await this.prisma.club.findUnique({
      where: { id },
    });

    if (!club) {
      throw new NotFoundException(`Club with ID ${id} not found`);
    }

    // Check if the user is the club admin or a system admin
    if (club.adminId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to delete this club');
    }

    return this.prisma.club.delete({
      where: { id },
    });
  }
}