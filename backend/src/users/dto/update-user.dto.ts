import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserDto {
  @ApiProperty({ example: 'johndoe', required: false })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ example: 'password123', required: false })
  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ enum: Role, example: Role.STUDENT, required: false })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}