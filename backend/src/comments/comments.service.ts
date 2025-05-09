import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Comment, User } from '@prisma/client';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    // First check if the post exists
    const postExists = await this.prisma.post.findUnique({
      where: { id: createCommentDto.postId },
    });

    if (!postExists) {
      throw new NotFoundException(`Post with ID ${createCommentDto.postId} not found`);
    }

    return this.prisma.comment.create({
      data: createCommentDto,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
      },
    });
  }

  async findByPost(postId: number): Promise<Comment[]> {
    const postExists = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!postExists) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    return this.prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async remove(id: number, user: User): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        post: true,
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    // Check if the user is the author of the comment, the author of the post, or an admin
    if (
      comment.authorId !== user.id &&
      comment.post.authorId !== user.id &&
      user.role !== 'ADMIN'
    ) {
      throw new ForbiddenException('You do not have permission to delete this comment');
    }

    return this.prisma.comment.delete({
      where: { id },
    });
  }
}