import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new PrismaExceptionFilter());
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://127.0.0.1:5173',
    credentials: true,
  });

  await app.listen(process.env.PORT || 8000);
}
bootstrap();
