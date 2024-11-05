import express from 'express';
import 'dotenv/config';
import { authRouter } from './routes/auth.route.js';
import cors from 'cors';
import { userRouter } from './routes/user.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import cookieParser from 'cookie-parser';

const app = express();

export const createServer = () => {
  app.use(express.static('public'));
  app.use(express.json());
  app.use(cookieParser());
  app.use(cors());
  app.use(authRouter);
  app.use('/users', userRouter);
  app.use(errorMiddleware);

  return app;
};
