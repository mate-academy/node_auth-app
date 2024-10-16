'use strict';

import express from 'express';
import { authRouter } from './routers/auth.router.js';
import { usersRouter } from './routers/users.router.js';
import cors from 'cors';
import { errorMiddleware } from './middlewares/error.middleware.js';

export const createServer = () => {
  const app = express();

  const corsOptions = {
    origin: '*',
    credentials: true,
  };

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(authRouter);
  app.use('/users', usersRouter);
  app.use(errorMiddleware);

  return app;
};
