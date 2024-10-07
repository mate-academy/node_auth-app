/* eslint-disable no-console */
'use strict';

import 'dotenv/config';
import express from 'express';
import { authRouter } from './routes/auth.route.js';
import cors from 'cors';
import { userRouter } from './routes/user.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import cookieParser from 'cookie-parser';
import { profileRouter } from './routes/profile.route.js';

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

app.get('/', (req, res) => {
  res.send('Home Page');
});

app.use(authRouter);
app.use('/users', userRouter);
app.use('/profile', profileRouter);

app.use(errorMiddleware);

app.listen(PORT, () => {
  process.stdout.write(`Server is running on http://localhost:${PORT}`);
});
