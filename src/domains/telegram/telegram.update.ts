import { SkipThrottle } from '@nestjs/throttler';
import { Update, Ctx, On } from 'nestjs-telegraf';
import { Context } from 'telegraf';

@SkipThrottle()
@Update()
export class TelegramUpdate {
  @On('text')
  onMessage(@Ctx() ctx: Context) {
    console.log('Mensagem recebida:', ctx.message);
  }
}
