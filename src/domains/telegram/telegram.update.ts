import { SkipThrottle } from '@nestjs/throttler';
import { Update, Ctx, On, Command, Action } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { UsersService } from '../users/users.service';
import { RedisService } from 'src/redis/redis.service';
import { CategoriesService } from '../categories/categories.service';
import { TelegramUserGuard } from '../auth/guards/telegram-auth.guard';
import { UseGuards } from '@nestjs/common';

@UseGuards(TelegramUserGuard)
@SkipThrottle()
@Update()
export class TelegramUpdate {
  constructor(
    private readonly usersService: UsersService,
    private readonly redisService: RedisService,
    private readonly categoriesService: CategoriesService,
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
    const user = ctx.state.user;

    const categoriesByUser =
      await this.categoriesService.findCategoriesByUserId(user.id);

    if (!categoriesByUser || categoriesByUser.length === 0) {
      await ctx.reply(
        'Você não possui categorias cadastradas. Por favor, cadastre uma categoria primeiro.',
      );
      return;
    }

    const listCategories = Markup.inlineKeyboard(
      categoriesByUser.map((category) => [
        Markup.button.callback(category.name, `select_category_${category.id}`),
      ]),
    );

    await ctx.reply('Selecione uma categoria para a despesa:', listCategories);
  }

  @Action(/select_category_(.+)/)
  async onSelectCategory(@Ctx() ctx: Context & { match: RegExpMatchArray }) {
    const categoryId = ctx.match[1];
    console.log('Mensagem recebida:', categoryId);
    await ctx.reply(
      `Você selecionou a categoria com ID: ${categoryId}. Agora, por favor, envie o valor da despesa.`,
    );
  }

  @On('text')
  onMessage(@Ctx() ctx: Context) {
    console.log('Mensagem recebida:', ctx.message);
  }
}
