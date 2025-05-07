import express from 'express';
import cors from 'cors';
import { router as authRouter } from './routers/auth.route.js';
import { router as usersRouter } from './routers/users.route.js';

export const createServer = () => {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  app.use('/auth', authRouter);
  app.use('/users', usersRouter);

  return app;
};
