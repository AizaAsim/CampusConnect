import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClubMember, User, Role } from '@prisma/client';
import { CreateClubMemberDto } from './dto/create-club-member.dto';
import { UpdateClubMemberDto } from './dto/update-club-member.dto';

@Injectable()
export class ClubMembersService {
  constructor(private prisma: PrismaService) {}

  async create(createClubMemberDto: CreateClubMemberDto): Promise<ClubMember> {
    // Check if club exists
    const club = await this.prisma.club.findUnique({
      where: { id: createClubMemberDto.clubId },
    });

    if (!club) {
      throw new NotFoundException(`Club with ID ${createClubMemberDto.clubId} not found`);
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: createClubMemberDto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${createClubMemberDto.userId} not found`);
    }

    // Check if membership already exists
    const existingMember = await this.prisma.clubMember.findFirst({
      where: {
        clubId: createClubMemberDto.clubId,
        userId: createClubMemberDto.userId,
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this club');
    }

    return this.prisma.clubMember.create({
      data: createClubMemberDto,
      include: {
        user: {
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

  async findByClub(clubId: number): Promise<ClubMember[]> {
    // Check if club exists
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club) {
      throw new NotFoundException(`Club with ID ${clubId} not found`);
    }

    return this.prisma.clubMember.findMany({
      where: { clubId },
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
        joinedAt: 'asc',
      },
    });
  }

  async findByUser(userId: number): Promise<ClubMember[]> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.prisma.clubMember.findMany({
      where: { userId },
      include: {
        club: {
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
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });
  }

  async update(
    clubId: number,
    userId: number,
    updateClubMemberDto: UpdateClubMemberDto,
    currentUser: User,
  ): Promise<ClubMember> {
    // Find the membership
    const member = await this.prisma.clubMember.findFirst({
      where: {
        clubId,
        userId,
      },
    });

    if (!member) {
      throw new NotFoundException(`Club membership not found`);
    }

    // Find the club to check permissions
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
    });

    // Check if the current user is the club admin or a system admin
    if (club.adminId !== currentUser.id && currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to update club memberships');
    }

    return this.prisma.clubMember.update({
      where: {
        id: member.id,
      },
      data: updateClubMemberDto,
      include: {
        user: {
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

  async remove(clubId: number, userId: number, currentUser: User): Promise<ClubMember> {
    // Find the membership
    const member = await this.prisma.clubMember.findFirst({
      where: {
        clubId,
        userId,
      },
    });

    if (!member) {
      throw new NotFoundException(`Club membership not found`);
    }

    // Find the club to check permissions
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
    });

    // Allow removal if:
    // 1. The current user is removing themselves (leaving the club)
    // 2. The current user is the club admin
    // 3. The current user is a system admin
    if (
      currentUser.id !== userId &&
      club.adminId !== currentUser.id &&
      currentUser.role !== Role.ADMIN
    ) {
      throw new ForbiddenException('You do not have permission to remove this club member');
    }

    return this.prisma.clubMember.delete({
      where: {
        id: member.id,
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
        club: true,
      },
    });
  }
}