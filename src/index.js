/* eslint-disable no-console */
'use strict';

import express from 'express';

import 'dotenv/config';

import { authRouter } from './routes/auth.route.js';

import cors from 'cors';

import { userRouter } from './routes/user.route.js';

import { errorMiddleware } from './middlewares/errorMiddleware.js';

import cookieParser from 'cookie-parser';

import { profileRouter } from './routes/profile.route.js';

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

app.use(authRouter);

app.use('/users', userRouter);

app.use('/profile', profileRouter);

app.get('/', (req, res) => {
  res.send('hello');
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console

  console.log('server is running');
});
