import cors from 'cors';
import express from 'express';

import { authRoute } from './routes/auth.route.js';
import { userRoute } from './routes/user.route.js';

import { authMiddleware } from './middlewares/auth.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

export function createServer() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use('/auth', authRoute);
  app.use('/profile', authMiddleware, userRoute);

  app.use(errorMiddleware);

  return app;
}
