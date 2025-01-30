'use strict';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import 'dotenv/config';

import { errorMiddleware } from './middlewares/errorMiddleware.js';

import { authRouter } from './routes/auth.route.js';
import { userRouter } from './routes/user.route.js';

const PORT = process.env.SERVER_PORT || 3005;

const app = express();

app.use(cookieParser());
app.use(errorMiddleware);
app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use('/auth', authRouter);
app.use('/user', userRouter);

app.get('*', async (req, res) => {
  return res.sendStatus(404);
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running at http://localhost:${PORT}`);
});
