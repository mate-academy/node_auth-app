'use strict';

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/authRouter.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { userRouter } from './routes/userRouter.js';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.use(authRouter);
app.use('/users', userRouter);
app.use(errorMiddleware);

app.listen(PORT);
