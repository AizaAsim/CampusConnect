import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'This is a great post!' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  postId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  authorId: number;
}