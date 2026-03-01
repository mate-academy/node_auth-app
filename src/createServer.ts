import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { router as usersRouter } from './routes/users.routes.ts';
import { router as refreshRouter } from './routes/tokens.routes.ts';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './middlewares/errorMiddleware.ts';

export function createServer() {
  const app = express();

  const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

  const corsOptions = {
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(cookieParser());
  app.use('/', usersRouter);
  app.use('/', refreshRouter);

  app.use(errorMiddleware);

  app.use((_, res) => {
    res.sendStatus(404);
  });

  return app;
}
