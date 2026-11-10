'use strict';

import express from 'express';
import cors from 'cors';
import { userRouter } from '../feature/User/user.router.js';
import { expenseRouter } from '../feature/Expense/expense.router.js';
import { authRouter } from '../feature/Auth/auth.router.js';
import { profileRouter } from '../feature/Profile/profile.router.js';

export const createServer = () => {
  const app = express();

  app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
  });

  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    }),
  );
  app.use(express.json());

  app.use('/auth', authRouter);
  app.use('/profile', profileRouter);
  app.use('/users', userRouter);
  app.use('/expenses', expenseRouter);

  return app;
};
