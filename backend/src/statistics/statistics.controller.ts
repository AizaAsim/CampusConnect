import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Request } from 'express';

@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get overview statistics for the platform' })
  @ApiResponse({ status: 200, description: 'Overview statistics retrieved successfully.' })
  getOverview() {
    return this.statisticsService.getOverviewStatistics();
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get statistics for a specific user' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  getUserStatistics(@Param('userId') userId: string, @Req() req: Request) {
    // If the user is requesting their own statistics, use their ID from the token
    if (userId === 'me') {
      userId = req.user['id'];
    }
    
    return this.statisticsService.getUserStatistics(+userId);
  }

  @Get('admin/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admin dashboard statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Admin statistics retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getAdminDashboard() {
    const overview = await this.statisticsService.getOverviewStatistics();
    
    // Add any additional admin-specific statistics here
    return {
      ...overview,
      adminOnly: true,
    };
  }
}