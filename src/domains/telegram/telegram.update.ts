import { SkipThrottle } from '@nestjs/throttler';
import { Update, Ctx, On, Command, Action } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { UsersService } from '../users/users.service';
import { RedisService } from 'src/redis/redis.service';
import { CategoriesService } from '../categories/categories.service';
import { TelegramUserGuard } from '../auth/guards/telegram-auth.guard';
import { UseGuards } from '@nestjs/common';
import { ExpensesService } from '../expenses/expenses.service';

@SkipThrottle()
@Update()
export class TelegramUpdate {
  constructor(
    private readonly usersService: UsersService,
    private readonly redisService: RedisService,
    private readonly categoriesService: CategoriesService,
    private readonly expensesService: ExpensesService,
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

  @UseGuards(TelegramUserGuard)
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

  @UseGuards(TelegramUserGuard)
  @Action(/select_category_(.+)/)
  async onSelectCategory(@Ctx() ctx: Context & { match: RegExpMatchArray }) {
    const categoryId = ctx.match[1];

    const category = await this.categoriesService.findById(categoryId);
    if (!category) {
      await ctx.reply('Categoria não encontrada. Por favor, tente novamente.');
      return;
    }

    const categoryString = JSON.stringify(category);

    await this.redisService.set(
      `selected_category:${ctx.chat?.id}`,
      categoryString,
      10000,
    );

    await ctx.reply(
      `Você selecionou a categoria: ${category.name}. Agora, por favor, envie o valor da despesa. No formato: despesa, valor. Exemplo: sorvete, 10`,
    );
  }

  @UseGuards(TelegramUserGuard)
  @Command('hoje')
  async onTodayExpenses(@Ctx() ctx: Context) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const expenses = await this.expensesService.findExpensesByDate(
      ctx.state.user.id,
      startOfDay,
      endOfDay,
    );

    if (!expenses || expenses.length === 0) {
      await ctx.reply('Você não possui despesas cadastradas para hoje.');
      return;
    }

    const sumExpenses = expenses.reduce(
      (acc, expense) => acc + expense.amount.toNumber(),
      0,
    );

    let message = 'Despesas de hoje:\n\n';
    expenses.forEach((expense) => {
      message += `Descrição: ${expense.description}, Valor: ${expense.amount}\n`;
    });
    message += `\nTotal: ${sumExpenses.toFixed(2)}`;

    await ctx.reply(message);
  }

  @UseGuards(TelegramUserGuard)
  @Command('mes')
  async onMonthlyExpenses(@Ctx() ctx: Context) {
    const now = new Date();
    const actualYear = now.getFullYear();
    const actualMonth = now.getMonth();

    const startOfMonth = new Date(actualYear, actualMonth, 1, 0, 0, 0, 0);

    const endOfMonth = new Date(
      actualYear,
      actualMonth + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const expenses = await this.expensesService.findExpensesByDate(
      ctx.state.user.id,
      startOfMonth,
      endOfMonth,
    );

    if (!expenses || expenses.length === 0) {
      await ctx.reply('Você não possui despesas cadastradas para este mês.');
      return;
    }

    const sumExpenses = expenses.reduce(
      (acc, expense) => acc + expense.amount.toNumber(),
      0,
    );

    let message = 'Despesas do mês:\n\n';
    expenses.forEach((expense) => {
      message += `Descrição: ${expense.description}, Valor: ${expense.amount}\n`;
    });
    message += `\nTotal: ${sumExpenses.toFixed(2)}`;

    await ctx.reply(message);
  }

  @UseGuards(TelegramUserGuard)
  @On('text')
  async onMessage(@Ctx() ctx: Context) {
    console.log('Mensagem recebida:', ctx.message);
    const categorySelected = await this.redisService.get(
      `selected_category:${ctx.chat?.id}`,
    );

    if (!categorySelected) {
      await ctx.reply(
        'Por favor, selecione uma categoria primeiro usando o comando /cadastrar_despesa.',
      );
      return;
    }

    const parsedCategory = JSON.parse(categorySelected);
    const expenseDescription = ctx.text?.split(',')[0]?.trim();
    const expenseValue = ctx.text?.split(',')[1]?.trim();
    if (!expenseDescription || !expenseValue) {
      await ctx.reply(
        'Formato inválido. Por favor, envie no formato: despesa, valor. Exemplo: sorvete, 10',
      );
      return;
    }

    const expenseValueNumber = parseFloat(expenseValue);
    if (isNaN(expenseValueNumber)) {
      await ctx.reply(
        'Valor inválido. Por favor, envie um número válido para o valor da despesa.',
      );
      return;
    }

    await this.expensesService.create(
      {
        amount: expenseValueNumber,
        description: expenseDescription,
        categoriesId: parsedCategory.id,
      },
      ctx.state.user.id,
    );

    await ctx.reply(
      `Despesa cadastrada com sucesso! Descrição: ${expenseDescription}, Valor: ${expenseValueNumber}, Categoria: ${parsedCategory.name}`,
    );

    await this.redisService.delete(`selected_category:${ctx.chat?.id}`);
  }
}
