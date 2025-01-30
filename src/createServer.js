'use strict';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.route.js';
import { usersRouter } from './routes/users.route.js';

const app = express();

export const createServer = () => {
  app.use(express.json());

  app.use(
    cors({
      origin: process.env.CLIENT_HOST,
      credentials: true,
    }),
  );
  app.use('/auth', authRouter);
  app.use('/users', usersRouter);

  return app;
};
