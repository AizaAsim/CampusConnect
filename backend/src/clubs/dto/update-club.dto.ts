import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateClubDto {
  @ApiProperty({ example: 'Updated Computer Science Club', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Updated description for computer science enthusiasts', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'STEM', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 'Fridays at 6:00 PM', required: false })
  @IsString()
  @IsOptional()
  meetingTime?: string;
}