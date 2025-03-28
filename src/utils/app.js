import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import { todosRouter } from './api/todos.router.js';
import { authRouter } from './api/auth.router.js';
import { usersRouter } from './api/users.router.js';

export function createApp() {
  const app = express();

  app.use(express.json());

  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    }),
  );
  app.use('/auth', authRouter);
  app.use('/todos', todosRouter);
  app.use('/users', usersRouter);

  return app;
}
