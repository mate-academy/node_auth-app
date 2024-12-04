'use strict';

import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';

import authRouter from './routers/auth.route.js';
import userRouter from './routers/user.route.js';

import errorMiddleware from './middlewares/errorMiddleware.js';
import checkAuth from './middlewares/authMiddleware.js';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/user', checkAuth, userRouter);

app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
});
