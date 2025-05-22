'use strict';

import 'dotenv/config';
import express from 'express';
import { authRouter } from './route/auth.route.js';
import cors from 'cors';
import { userRouter } from './route/user.route.js';
import { errorMiddleware } from './middlewares/errorMiddlewares.js';
import cookieParser from 'cookie-parser';

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
app.use('/users', userRouter);

app.get('/', (req, res) => {
  res.send('Hello');
});
app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('start');
});
