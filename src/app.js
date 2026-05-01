import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.router.js';
import { profileRouter } from './routes/profile.router.js';
import { usersRouter } from './routes/user.router.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

export function createServer() {
  const app = express();

  app.use(express.json());

  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    }),
  );

  app.use(cookieParser());

  app.use('/auth', authRouter);
  app.use('/profile', profileRouter);
  app.use('/users', usersRouter);

  app.use((req, res) => {
    res.status(404).json({
      message: 'Not found',
    });
  });

  app.use(errorMiddleware);

  return app;
}
