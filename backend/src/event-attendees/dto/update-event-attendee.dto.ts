import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Status } from '@prisma/client';

export class UpdateEventAttendeeDto {
  @ApiProperty({ enum: Status, example: Status.GOING })
  @IsEnum(Status)
  status: Status;
}