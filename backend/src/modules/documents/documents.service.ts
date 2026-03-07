import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma, Document } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentDto, UpdateDocumentDto } from './documents.dto';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDocumentDto, userId: string) {
    return this.prisma.document.create({
      data: {
        title: dto.title,
        content: dto.content as Prisma.InputJsonValue,
        authorId: userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.document.findMany({
      where: { authorId: userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
      },
    });
  }

  async findById(id: string, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: { author: { select: { email: true, id: true } } },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.authorId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return document;
  }

  async update(id: string, dto: UpdateDocumentDto, userId: string) {
    const document = await this.findById(id, userId);

    return this.prisma.document.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.content && { content: dto.content as Prisma.InputJsonValue }),
      },
    });
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId);

    return this.prisma.document.delete({
      where: { id },
    });
  }
}
