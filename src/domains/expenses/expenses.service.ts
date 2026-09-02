import { Injectable } from '@nestjs/common';
import { ExpensesRepository } from './expenses.repository';
import { CreateExpenseDto } from './dtos/create-expenses.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly expensesRepository: ExpensesRepository) {}

  async findAll(userId: string) {
    return this.expensesRepository.findAll(userId);
  }

  async findById(id: string) {
    return this.expensesRepository.findById(id);
  }

  async delete(id: string) {
    return this.expensesRepository.delete(id);
  }

  async create(data: CreateExpenseDto, userId: string) {
    return this.expensesRepository.create({
      description: data.description,
      amount: data.amount,
      categoriesId: data.categoriesId,
      userId,
    });
  }

  async update(id: string, data: { description: string; amount: number }) {
    return this.expensesRepository.update(id, data);
  }

  async findExpensesByDate(userId: string, startDate: Date, endDate: Date) {
    return this.expensesRepository.findExpensesByDate(
      userId,
      startDate,
      endDate,
    );
  }
}
