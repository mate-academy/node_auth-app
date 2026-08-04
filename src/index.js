'use strict';
import 'dotenv/config';
import express from 'express';
import { authRouter } from './routes/auth.route.js';
import cors from 'cors';
import './setup.js';
import { userRouter } from './routes/user.route.js';
import { profileRouter } from './routes/profile.route.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/profile', profileRouter);
app.use((req, res) => res.sendStatus(404));
app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running!');
});
