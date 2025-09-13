import express from 'express';
import cors from 'cors';
import { userRouter } from './routes/userRouter.js';
import { authRouter } from './routes/authRouter.js';
import { profileRouter } from './routes/profileRouter.js';
import cookieParser from 'cookie-parser';

export function createServer() {
  const server = express();

  server.use(express.json());
  server.use(cookieParser());

  server.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
      credentials: true,
    }),
  );

  server.get('/', (req, res) => {
    res.status(200).send('Server is running');
  });

  server.use('/users', userRouter);
  server.use('/auth', authRouter);
  server.use('/profile', profileRouter);

  server.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
  });

  return server;
}
