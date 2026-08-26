import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './domains/users/users.module';
import { AuthModule } from './domains/auth/auth.module';
import { JwtAuthMiddleware } from './middleware/jwt-auth.middleware';
import { CategoriesModule } from './domains/categories/categories.module';
import { ExpensesModule } from './domains/expenses/expenses.module';
import { TelegramModule } from './domains/telegram/telegram.module';
import { RedisModule } from './redis/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    RedisModule,
    UsersModule,
    AuthModule,
    ExpensesModule,
    CategoriesModule,
    TelegramModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtAuthMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/logout', method: RequestMethod.POST },
        { path: 'users', method: RequestMethod.POST },
        { path: 'api', method: RequestMethod.GET },
        { path: 'api/(.*)', method: RequestMethod.GET },
        {
          path: this.configService.get<string>('TELEGRAM_PATH')!,
          method: RequestMethod.POST,
        },
      )
      .forRoutes('*');
  }
}
