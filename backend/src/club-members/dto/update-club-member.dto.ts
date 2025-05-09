import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateClubMemberDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isAdmin: boolean;
}