import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRoute } from './routes/auth.route.js';
import { errorMiddleware } from './middleware/error.middleware.js';

export function createServer() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_HOST,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());
  app.use(authRoute);

  app.get('/', (req, res) => {
    res.send('Hello');
  });

  app.use(errorMiddleware);

  return app;
}
