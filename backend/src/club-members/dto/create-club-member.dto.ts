import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsBoolean, IsOptional } from 'class-validator';

export class CreateClubMemberDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  clubId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;
}