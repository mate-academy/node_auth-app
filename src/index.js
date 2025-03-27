'use strict';

import cookieParser from 'cookie-parser';
import express from 'express';
import 'dotenv/config';
import cors from 'cors';

import { authRouter } from './routes/auth.route';
import { userRouter } from './routes/user.route';
import { errorMiddleware } from './middlewares/errorMiddleware';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(authRouter);
app.use('/users', userRouter);
app.use(errorMiddleware);

app.listen(PORT);
