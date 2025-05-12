import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true,}),
  );
  app.enableCors({
    origin:[process.env.FRONTEND_ORIGIN, '*'],
    credentials: true,
  });
  app.use(json({ limit: '10mb' }));
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();