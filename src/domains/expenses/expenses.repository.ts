import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateExpenseDto } from './dtos/create-expenses.dto';

@Injectable()
export class ExpensesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.expense.findMany({
      where: {
        user: {
          id: userId,
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.expense.findUnique({
      where: {
        id,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.expense.delete({
      where: {
        id,
      },
    });
  }

  async create(data: CreateExpenseDto & { userId: string }) {
    return this.prisma.expense.create({
      data: {
        description: data.description,
        amount: data.amount,
        categories: {
          connect: {
            id: data.categoriesId,
          },
        },
        user: {
          connect: {
            id: data.userId,
          },
        },
      },
    });
  }

  async update(id: string, data: { description: string; amount: number }) {
    return this.prisma.expense.update({
      where: {
        id,
      },
      data,
    });
  }
}
