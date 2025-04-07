'use strict';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.router.js';
import { userRouter } from './routes/users.router.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { ApiError } from './exceptions/api.error.js';

const PORT = process.env.PORT;

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(errorMiddleware);
app.use(authRouter);
app.use('/user', userRouter);

app.use((req, res, next) => {
  next(ApiError.NotFound());
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on PORT ${PORT}`);
});
