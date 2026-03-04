import express from 'express';
import { authRouter } from './api/auth.router.js';
import cors from 'cors';
import { usersRouter } from './api/users.router.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { profileRouter } from './api/profile.router.js';

export const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/profile', profileRouter);

app.use((req, res) => {
  res.status(404).json({
    message: 'Not Found',
  });
});
app.use(errorMiddleware);
