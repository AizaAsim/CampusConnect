import { Module } from '@nestjs/common';
import { EventAttendeesService } from './event-attendees.service';
import { EventAttendeesController } from './event-attendees.controller';

@Module({
  controllers: [EventAttendeesController],
  providers: [EventAttendeesService],
  exports: [EventAttendeesService],
})
export class EventAttendeesModule {}