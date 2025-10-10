import express from 'express';
import { authRouter } from './routes/auth.route.js';
import cors from 'cors';
import { userRouter } from './routes/user.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

export const createServer = () => {
  const app = express();

  app.use(express.json());

  app.use(cors({ origin: process.env.CLIENT_HOST, credentials: true }));
  app.use(cookieParser());

  app.use('/', authRouter);
  app.use('/', userRouter);

  app.use((req, res) => {
    res.status(404).send('Page not found');
  });

  app.use(errorMiddleware);

  return app;
};
