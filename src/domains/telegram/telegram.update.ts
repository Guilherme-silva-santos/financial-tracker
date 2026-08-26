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

    await this.usersService.updateUserTelegramChatId(
      userId,
      String(ctx.chat?.id),
    );
    await ctx.reply('Seu chat do Telegram foi vinculado com sucesso!');
  }

  @On('text')
  onMessage(@Ctx() ctx: Context) {
    console.log('Mensagem recebida:', ctx.message);
  }
}
