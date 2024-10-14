'use strict';

import express from 'express';
import { authRouter } from './routers/auth.router.js';
import cors from 'cors';

export const createServer = () => {
  const app = express();

  const corsOptions = {
    origin: '*',
    credentials: true,
  };

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(authRouter);

  return app;
};
