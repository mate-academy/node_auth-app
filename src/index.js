/* eslint-disable no-console */
'use strict';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.routes.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import cookieParser from 'cookie-parser';
import { userRouter } from './routes/user.routes.js';
import { ConsoleLogger } from './untils/consoleLogger.js';

const PORT = process.env.PORT || 3004;

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Welcome');
});

app.use('/auth', authRouter);
app.use('/users', userRouter);

app.use(errorMiddleware);

app.listen(PORT, () => {
  ConsoleLogger.log(`Server is running ${PORT}`);
});
