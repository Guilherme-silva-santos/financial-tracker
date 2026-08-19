import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator';

import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dtos/create-expenses.dto';

@Controller('expenses')
@ApiTags('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all expenses for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of expenses retrieved successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.expensesService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an expense by ID' })
  @ApiResponse({
    status: 200,
    description: 'Expense retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'Expense not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  async findById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.expensesService.findById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an expense by ID' })
  @ApiResponse({
    status: 200,
    description: 'Expense deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Expense not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.expensesService.delete(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiResponse({
    status: 201,
    description: 'Expense created successfully.',
  })
  @ApiBody({ description: 'Expense data', type: CreateExpenseDto })
  @ApiResponse({ status: 400, description: 'Invalid request data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createExpenseDto: CreateExpenseDto,
  ) {
    return this.expensesService.create(
      {
        description: createExpenseDto.description,
        amount: createExpenseDto.amount,
        categoriesId: createExpenseDto.categoriesId,
      },
      user.id,
    );
  }
}
