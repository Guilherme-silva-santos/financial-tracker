import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dtos/create-category.dto';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.category.findMany({
      where: {
        user: {
          id: userId,
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.category.findUnique({
      where: {
        id,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.category.delete({
      where: {
        id,
      },
    });
  }

  async create(data: CreateCategoryDto & { userId: string }) {
    return this.prisma.category.create({
      data: {
        name: data.name,
        user: {
          connect: {
            id: data.userId,
          },
        },
      },
    });
  }

  async update(id: string, data: { name: string }) {
    return this.prisma.category.update({
      where: {
        id,
      },
      data,
    });
  }

  async findCategoriesByUserId(userId: string) {
    return this.prisma.category.findMany({
      where: {
        userId,
      },
      select: {
        name: true,
      },
    });
  }
}
