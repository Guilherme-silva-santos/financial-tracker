import { SkipThrottle } from '@nestjs/throttler';
import { Update, Ctx, On, Command } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { UsersService } from '../users/users.service';
import { RedisService } from 'src/redis/redis.service';

@SkipThrottle()
@Update()
export class TelegramUpdate {
  constructor(
    private readonly usersService: UsersService,
    private readonly redisService: RedisService,
  ) {}
  @Command('start')
  async onStart(@Ctx() ctx: Context) {
    const code = ctx.text?.split(' ')[1];
    console.log('Mensagem recebida:', code);

    const userId = await this.redisService.get(`chatcode:${code}`);
    console.log('Mensagem recebida:', userId);
    if (!userId) {
      await ctx.reply(
        'Código inválido ou expirado. Por favor, tente novamente.',
      );
      return;
    }
    try {
      await this.usersService.updateUserTelegramChatId(
        userId,
        String(ctx.chat?.id),
      );
      await ctx.reply('Seu chat do Telegram foi vinculado com sucesso!');
    } catch (error) {
      await ctx.reply(
        'Ocorreu um erro ao vincular seu chat do Telegram. Por favor, tente novamente.',
      );
      console.error('Erro ao vincular chat do Telegram:', error);
    }
  }

  @Command('cadastrar_despesa')
  async onRegisterExpense(@Ctx() ctx: Context) {
    console.log('id', ctx.chat?.id);
  }

  @On('text')
  onMessage(@Ctx() ctx: Context) {
    console.log('Mensagem recebida:', ctx.message);
  }
}
