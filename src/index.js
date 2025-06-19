/* eslint-disable no-console */
'use strict';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.router.js';
import cookieParser from 'cookie-parser';
import { globalErrorHandler } from './middlewares/error.middleware.js';

const PORT = process.env.PORT || 3007;

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use('/auth', authRouter);
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
