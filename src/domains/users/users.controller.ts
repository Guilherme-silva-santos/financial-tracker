import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from './dtos/create-user.dto';
import { GetUserDto } from './dtos/get-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(): Promise<GetUserDto[]> {
    const users = await this.usersService.findAll();
    return users.map((user) => new GetUserDto(user));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findById(@Param('id') id: string): Promise<GetUserDto | null> {
    const user = await this.usersService.findById(id);
    return user ? new GetUserDto(user) : null;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ description: 'User data', type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  createUser(@Body() data: CreateUserDto) {
    return this.usersService.createUser(data);
  }

  @Patch(':id/telegram-chat-id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user Telegram chat ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID' })
  @ApiBody({
    description: 'Telegram chat ID',
    schema: {
      type: 'object',
      properties: { telegramChatId: { type: 'string' } },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Telegram chat ID updated successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserTelegramChatId(
    @CurrentUser() user: AuthenticatedUser,
    @Body('telegramChatId') telegramChatId: string,
  ) {
    return this.usersService.updateUserTelegramChatId(user.id, telegramChatId);
  }
}
