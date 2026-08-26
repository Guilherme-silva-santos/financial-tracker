import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll() {
    return this.usersRepository.findAll();
  }

  async findById(id: string) {
    return this.usersRepository.findById(id);
  }

  async createUser(data: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.usersRepository.createUser({
      ...data,
      password: hashedPassword,
    });
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async updateUserTelegramChatId(id: string, telegramChatId: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    return this.usersRepository.updateUserTelegramChatId(id, telegramChatId);
  }
}
