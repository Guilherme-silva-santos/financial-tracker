import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import 'dotenv/config';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { TransformDecimalInterceptor } from './commom/interceptors/transform-decimal.interceptor';
import { getBotToken } from 'nestjs-telegraf';

async function bootstrap() {
  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET === 'change_me_in_production'
  ) {
    throw new Error(
      'JWT_SECRET must be set to a strong secret before starting the server.',
    );
  }
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new TransformDecimalInterceptor());
  const bot = app.get(getBotToken());
  app.use(bot.webhookCallback(process.env.TELEGRAM_PATH));

  const config = new DocumentBuilder()
    .setTitle('Financial Tracker API')
    .setDescription('The Financial Tracker API description')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
