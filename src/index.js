'use strict';

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from '../src/routers/auth.router.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { userRouter } from './routers/user.router.js';

const PORT = process.env.PORT || 3005;

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
app.use('/user', userRouter);

app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on PORT: ${PORT}`);
});
