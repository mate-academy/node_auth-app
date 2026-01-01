/* eslint-disable no-console */
'use strict';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routers/auth.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { userRouter } from './routers/user.route.js';
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

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log('Server is running on http://localhost:3005');
});
