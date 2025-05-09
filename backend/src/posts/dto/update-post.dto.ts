import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdatePostDto {
  @ApiProperty({ example: 'Updated Event Announcement', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Updated content about our annual club event...', required: false })
  @IsString()
  @IsOptional()
  content?: string;
}