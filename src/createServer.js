import express from 'express';
import 'dotenv/config';
import { authRouter } from './routes/auth.route.js';
import cors from 'cors';
import { userRouter } from './routes/user.route.js';

const app = express();

export const createServer = () => {
  app.use(cors());
  app.use(express.static('public'));
  app.use(express.json());
  app.use(authRouter);
  app.use('/users', userRouter);

  return app;
};
