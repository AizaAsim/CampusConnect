import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EventAttendeesService } from './event-attendees.service';
import { CreateEventAttendeeDto } from './dto/create-event-attendee.dto';
import { UpdateEventAttendeeDto } from './dto/update-event-attendee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { User } from '@prisma/client';

@ApiTags('event-attendees')
@Controller('event-attendees')
export class EventAttendeesController {
  constructor(private readonly eventAttendeesService: EventAttendeesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register for an event' })
  @ApiResponse({ status: 201, description: 'Registration successful.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Event or user not found.' })
  @ApiResponse({
    status: 409,
    description: 'User is already registered for this event.',
  })
  create(
    @Body() createEventAttendeeDto: CreateEventAttendeeDto,
    @Req() req: Request,
  ) {
    // Override the userId with the authenticated user's ID
    createEventAttendeeDto.userId = (req.user as User).id;
    return this.eventAttendeesService.create(createEventAttendeeDto);
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get all attendees for an event' })
  @ApiResponse({
    status: 200,
    description: 'Event attendees retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  findByEvent(@Param('eventId') eventId: string) {
    return this.eventAttendeesService.findByEvent(+eventId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all events a user is attending' })
  @ApiResponse({
    status: 200,
    description: 'User event attendances retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findByUser(@Param('userId') userId: string) {
    return this.eventAttendeesService.findByUser(+userId);
  }

  @Patch('event/:eventId/user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update event attendance status' })
  @ApiResponse({
    status: 200,
    description: 'Attendance status updated successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 404,
    description: 'Event attendance record not found.',
  })
  update(
    @Param('eventId') eventId: string,
    @Param('userId') userId: string,
    @Body() updateEventAttendeeDto: UpdateEventAttendeeDto,
    @Req() req: Request,
  ) {
    // Only allow users to update their own attendance status
    if ((req.user as User).id !== +userId) {
      userId = String((req.user as User).id);
    }

    return this.eventAttendeesService.update(
      +eventId,
      +userId,
      updateEventAttendeeDto,
    );
  }

  @Delete('event/:eventId/user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove event attendance' })
  @ApiResponse({
    status: 200,
    description: 'Event attendance removed successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 404,
    description: 'Event attendance record not found.',
  })
  remove(
    @Param('eventId') eventId: string,
    @Param('userId') userId: string,
    @Req() req: Request,
  ) {
    // Only allow users to remove their own attendance
    if ((req.user as User).id !== +userId) {
      userId = String((req.user as User).id);
    }

    return this.eventAttendeesService.remove(+eventId, +userId);
  }
}
