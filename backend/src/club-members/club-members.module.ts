import { Module } from '@nestjs/common';
import { ClubMembersService } from './club-members.service';
import { ClubMembersController } from './club-members.controller';

@Module({
  controllers: [ClubMembersController],
  providers: [ClubMembersService],
  exports: [ClubMembersService],
})
export class ClubMembersModule {}