import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateClubDto {
  @ApiProperty({ example: 'Computer Science Club' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'A club for computer science enthusiasts' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Technology', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 'Thursdays at 5:00 PM', required: false })
  @IsString()
  @IsOptional()
  meetingTime?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  adminId: number;
}