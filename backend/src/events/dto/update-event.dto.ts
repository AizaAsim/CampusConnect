import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';

export class UpdateEventDto {
  @ApiProperty({ example: 'Updated Annual Club Meeting', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Updated description for our annual club meeting...', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2025-06-16T19:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  dateTime?: string;

  @ApiProperty({ example: 'Student Center, Room 202', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: 2, required: false })
  @IsInt()
  @IsOptional()
  clubId?: number;
}