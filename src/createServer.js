'use strict';

import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.router.js';

export const createServer = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.use('/', authRouter);

  return app;
};
