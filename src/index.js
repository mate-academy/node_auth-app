/* eslint-disable no-console */
'use strict';

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.route.js';
import { userRouter } from './routes/user.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { profileRoute } from './routes/profile.route.js';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(cookieParser());

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use(authRouter);
app.use('/users', userRouter);
app.use('/profile', profileRoute);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log('Your server is running on PORT: ', PORT);
});
