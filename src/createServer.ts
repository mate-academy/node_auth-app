import express from 'express';
import cors from 'cors';
import { router as usersRouter } from './routes/users.routes.ts';
import { router as refreshRouter } from './routes/tokens.routes.ts';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './middlewares/errorMiddleware.ts';

export function createServer() {
  const app = express();

  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }));
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
