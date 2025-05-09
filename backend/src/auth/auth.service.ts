import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async register(userData: any) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { username: userData.username },
    });

    if (existingUser) {
      throw new UnauthorizedException('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const newUser = await this.prisma.user.create({
      data: {
        username: userData.username,
        password: hashedPassword,
        fullName: userData.fullName,
        role: userData.role || 'STUDENT',
      },
    });

    const { password, ...result } = newUser;
    return result;
  }

  async getUserFromToken(token: string): Promise<Partial<User> | null> {
    try {
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;
      
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      
      if (!user) return null;
      
      // Remove sensitive data
      const { password, ...result } = user;
      return result;
    } catch (error) {
      return null;
    }
  }
}