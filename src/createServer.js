'use strict';

import express from 'express';
import cors from 'cors';
import { authRouter } from './routers/auth.router.js';
import { userRouter } from './routers/user.router.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import cookieParser from 'cookie-parser';

export function createServer() {
  const app = express();

  app.use(cors());

  app.use(express.json());
  app.use(cookieParser());

  app.use(authRouter);
  app.use('/user/', userRouter);

  app.use(errorMiddleware);

  return app;
}
