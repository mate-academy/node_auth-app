'use strict';

import express from 'express';
import cors from 'cors';
import { sequelizeSync } from './config/sequelize.sync.js';
import 'dotenv/config';
import { router as authRouter } from './router/auth.router.js';
import { userRouter } from './router/user.router.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT;

export function createServer() {
  const app = express();

  // CORS: разрешаем любые origin'ы, но с credentials
  app.use(
    cors({
      origin: (origin, callback) => {
        // Разрешаем все, кроме запросов без origin (например, curl)
        if (!origin) {
          return callback(null, false);
        }
        callback(null, origin); // можно добавить фильтр по origin
      },
      credentials: true, // важно, если используешь withCredentials
    }),
  );
  app.use(cookieParser());
  app.use(express.json()); // парсим JSON

  sequelizeSync(); // подключение к БД

  app.use(authRouter); // роутер авторизации
  app.use('/user', userRouter);

  app.use(errorMiddleware);

  return app;
}

createServer().listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
});
