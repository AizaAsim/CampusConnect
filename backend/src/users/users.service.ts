import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Partial<User>[]> {
    const users = await this.prisma.user.findMany();
    return users.map(({ password, ...rest }) => rest);
  }

  async findOne(id: number): Promise<Partial<User>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    const { password, ...result } = user;
    return result;
  }

  async findOneByUsername(username: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });
    
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    
    return user;
  }

  async create(data: Prisma.UserCreateInput): Promise<Partial<User>> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
    
    const { password, ...result } = user;
    return result;
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<Partial<User>> {
    // If password is being updated, hash it
    if (data.password) {
      data.password = await bcrypt.hash(data.password as string, 10);
    }
    
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    
    const { password, ...result } = user;
    return result;
  }

  async remove(id: number): Promise<Partial<User>> {
    const user = await this.prisma.user.delete({
      where: { id },
    });
    
    const { password, ...result } = user;
    return result;
  }
}