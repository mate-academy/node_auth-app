import express from 'express';
import { authRouter } from './routes/auth.route.js';
import { userRouter } from './routes/user.route.js';
import cors from 'cors';
// import { errorMiddleware } from './middlewares/errorMiddleware.js';
import cookieParser from 'cookie-parser';

export const createServer = () => {
  const app = express();
  app.use(
    cors({
      origin: process.env.CLIENT_HOST,
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(cookieParser());
  app.use(authRouter);
  app.use('/users', userRouter);
  // app.use(errorMiddleware);

  app.get('/', (req, res) => {
    res.send('Hello from server');
  });

  return app;
};
