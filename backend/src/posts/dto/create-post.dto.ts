import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'New Club Event Announcement' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Join us for our annual club event...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  authorId: number;
}