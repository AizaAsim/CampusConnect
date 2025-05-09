import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, IsOptional, IsDateString } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'Annual Club Meeting' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Join us for our annual club meeting...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '2025-06-15T18:00:00Z' })
  @IsDateString()
  dateTime: string;

  @ApiProperty({ example: 'Student Center, Room 101' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  organizerId: number;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  clubId?: number;
}