'use strict';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.route.js';

const app = express();

export const createServer = () => {
  app.use(express.json());
  app.use(cors());
  app.use(authRouter);

  return app;
};
