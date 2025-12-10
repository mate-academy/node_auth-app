'use strict';

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { router as authRouter } from './routes/auth.route.js';
import { router as userRouter } from './routes/user.route.js';
import { router as profileRouter } from './routes/profile.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
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

app.use(authRouter);
app.use('/users', userRouter);
app.use(profileRouter);

app.use((req, res, next) => {
  const error = new Error('Not Found');

  error.status = 404;
  next(error);
});
app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('server is running on 3005 port');
});
