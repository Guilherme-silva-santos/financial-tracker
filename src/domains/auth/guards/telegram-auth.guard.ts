import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TelegrafExecutionContext } from 'nestjs-telegraf';
import { UsersService } from 'src/domains/users/users.service';

@Injectable()
export class TelegramUserGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: TelegrafExecutionContext): Promise<boolean> {
    const ctx = context.getArgByIndex(0);
    console.log('Mensagem recebida:', ctx.chat?.id);
    const chatId = ctx.chat?.id;

    if (!chatId) {
      return false;
    }

    const user = await this.usersService.findUserByChatID(String(chatId));
    if (!user) {
      return false;
    }

    ctx.state.user = user;
    return true;
  }
}
