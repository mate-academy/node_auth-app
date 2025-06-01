/* eslint-disable no-console */
'use strict';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { authRouter } from './routes/auth.route.js';
import { userRouter } from './routes/user.route.js';

const PORT = process.env.PORT || 3005;
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use('/', authRouter);
app.use('/users', userRouter);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
