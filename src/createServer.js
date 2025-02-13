'use strict';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.route.js';
import { usersRouter } from './routes/users.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import cookieParser from 'cookie-parser';

const app = express();

export const createServer = () => {
  app.use(express.json());
  app.use(cookieParser());

  app.use(
    cors({
      origin: process.env.CLIENT_HOST,
      credentials: true,
    }),
  );
  app.use('/auth', authRouter);
  app.use('/profile', usersRouter);
  app.use(errorMiddleware);

  return app;
};
