import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandler.js';
import { authRouter } from './routes/auth.routes.js';
import { usersRouter } from './routes/users.routes.js';
// eslint-disable-next-line max-len
import { confirmEmailChangeController } from './controllers/users.controller.js';
import { notFound } from './middlewares/notFound.js';

export const createServer = () => {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

  app.use('/auth', authRouter);
  app.get('/users/me/email/confirm/:token', confirmEmailChangeController);
  app.use('/users', usersRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
