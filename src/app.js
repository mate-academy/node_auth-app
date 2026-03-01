import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import { authRouter } from './routes/auth.router.js';
import { userRouter } from './routes/user.router.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';
import { ApiError } from './exceptions/api.error.js';

export const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    }),
  );

  app.use('/auth', authRouter);
  app.use('/users', userRouter);

  app.use((req, res, next) => {
    next(ApiError.NotFound());
  });

  app.use(errorMiddleware);

  app.get('/', (_req, res) => {
    res.send('Auth API is running perfectly! 🚀');
  });

  return app;
};
