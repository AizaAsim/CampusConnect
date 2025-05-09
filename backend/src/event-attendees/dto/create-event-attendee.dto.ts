import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsEnum } from 'class-validator';
import { Status } from '@prisma/client';

export class CreateEventAttendeeDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  eventId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({ enum: Status, example: Status.GOING })
  @IsEnum(Status)
  status: Status;
}