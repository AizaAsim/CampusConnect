import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClubsService } from './clubs.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, User } from '@prisma/client';
import { Request } from 'express';

@ApiTags('clubs')
@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLUB_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new club (Club Admin or Admin only)' })
  @ApiResponse({ status: 201, description: 'Club created successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createClubDto: CreateClubDto, @Req() req: Request) {
    // Override the adminId with the authenticated user's ID
    createClubDto.adminId = (req.user as User).id;
    return this.clubsService.create(createClubDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all clubs' })
  @ApiResponse({ status: 200, description: 'Clubs retrieved successfully.' })
  findAll() {
    return this.clubsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a club by ID' })
  @ApiResponse({ status: 200, description: 'Club retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Club not found.' })
  findOne(@Param('id') id: string) {
    return this.clubsService.findOne(+id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get clubs by user ID' })
  @ApiResponse({ status: 200, description: 'Clubs retrieved successfully.' })
  findByUser(@Param('userId') userId: string) {
    return this.clubsService.findByUser(+userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a club' })
  @ApiResponse({ status: 200, description: 'Club updated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Club not found.' })
  update(
    @Param('id') id: string,
    @Body() updateClubDto: UpdateClubDto,
    @Req() req: Request,
  ) {
    return this.clubsService.update(+id, updateClubDto, req.user as User);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a club' })
  @ApiResponse({ status: 200, description: 'Club deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Club not found.' })
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.clubsService.remove(+id, req.user as User);
  }
}