import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { ClubsModule } from './clubs/clubs.module';
import { ClubMembersModule } from './club-members/club-members.module';
import { EventsModule } from './events/events.module';
import { EventAttendeesModule } from './event-attendees/event-attendees.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StatisticsModule } from './statistics/statistics.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PostsModule,
    CommentsModule,
    ClubsModule,
    ClubMembersModule,
    EventsModule,
    EventAttendeesModule,
    NotificationsModule,
    StatisticsModule,
  ],
})
export class AppModule {}