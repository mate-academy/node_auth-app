import express from 'express';
import 'dotenv/config';
import { authRouter } from './routes/auth.route.js';
import cors from 'cors';
import { userRouter } from './routes/user.route.js';
import { errorMiddlewares } from './middlewares/errorMiddlewares.js';
import cookieParser from 'cookie-parser';

export function createServer() {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  app.use(
    cors({
      origin: process.env.CLIENT_HOST,
      credentials: true,
    }),
  );

  app.use(authRouter);
  app.use('/users', userRouter);

  app.get('/', (req, res) => {
    res.send('hello');
  });
  app.use(errorMiddlewares);

  app.use('*', (req, res) => {
    res.status(404).json({ message: 'Not Found' });
  });

  return app;
}
