import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClubMembersService } from './club-members.service';
import { CreateClubMemberDto } from './dto/create-club-member.dto';
import { UpdateClubMemberDto } from './dto/update-club-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { User } from '@prisma/client';

@ApiTags('club-members')
@Controller('club-members')
export class ClubMembersController {
  constructor(private readonly clubMembersService: ClubMembersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join a club or add a member to a club' })
  @ApiResponse({ status: 201, description: 'Member added successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Club or user not found.' })
  @ApiResponse({ status: 409, description: 'User is already a member of this club.' })
  create(@Body() createClubMemberDto: CreateClubMemberDto) {
    return this.clubMembersService.create(createClubMemberDto);
  }

  @Get('club/:clubId')
  @ApiOperation({ summary: 'Get all members of a club' })
  @ApiResponse({ status: 200, description: 'Club members retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Club not found.' })
  findByClub(@Param('clubId') clubId: string) {
    return this.clubMembersService.findByClub(+clubId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all clubs a user is a member of' })
  @ApiResponse({ status: 200, description: 'User club memberships retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findByUser(@Param('userId') userId: string) {
    return this.clubMembersService.findByUser(+userId);
  }

  @Patch('club/:clubId/user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a club membership (change admin status)' })
  @ApiResponse({ status: 200, description: 'Club membership updated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Club membership not found.' })
  update(
    @Param('clubId') clubId: string,
    @Param('userId') userId: string,
    @Body() updateClubMemberDto: UpdateClubMemberDto,
    @Req() req: Request,
  ) {
    return this.clubMembersService.update(
      +clubId,
      +userId,
      updateClubMemberDto,
      req.user as User,
    );
  }

  @Delete('club/:clubId/user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a member from a club or leave a club' })
  @ApiResponse({ status: 200, description: 'Club membership removed successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Club membership not found.' })
  remove(
    @Param('clubId') clubId: string,
    @Param('userId') userId: string,
    @Req() req: Request,
  ) {
    return this.clubMembersService.remove(+clubId, +userId, req.user as User);
  }
}