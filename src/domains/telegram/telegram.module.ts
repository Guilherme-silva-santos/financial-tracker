import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramService } from './telegram.service';
import { TelegramUpdate } from './telegram.update';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_BOT_TOKEN')!,
        launchOptions: {
          webhook: {
            domain: configService.get<string>('TELEGRAM_DOMAIN')!,
            path: configService.get<string>('TELEGRAM_PATH')!,
          },
        },
      }),
    }),
  ],
  providers: [TelegramService, TelegramUpdate],
})
export class TelegramModule {}
