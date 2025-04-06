import express from 'express';
import cors from 'cors';
import { usersRouter } from './routers/usersRouter.js';
import { authRouter } from './routers/authRouter.js';
import cookieParser from 'cookie-parser';

export function createServer() {
  const server = express();

  server.use(cors());
  server.use(cookieParser());

  server.get('/', (req, res) => {
    res.status(200).json('hello node');
  });
  server.use('/', usersRouter);
  server.use('/auth', authRouter);

  return server;
}
