import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dtos/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async findAll(userId: string) {
    return this.categoriesRepository.findAll(userId);
  }

  async findById(id: string) {
    return this.categoriesRepository.findById(id);
  }

  async delete(id: string) {
    return this.categoriesRepository.delete(id);
  }

  async create(data: CreateCategoryDto, userId: string) {
    return this.categoriesRepository.create({
      name: data.name,
      userId,
    });
  }

  async update(id: string, data: { name: string }) {
    return this.categoriesRepository.update(id, data);
  }
}
