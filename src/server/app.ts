/* eslint-disable no-console */
'use strict';
import 'dotenv/config';
import cors from 'cors';
import express from 'express';

import { authRouter } from './routes/auth.router.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { userRouter } from './routes/user.router.js';
import { authMiddleware } from './middlewares/authMiddleware.js';

const app = express();

const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());

app.use('/auth', authRouter);
app.use('/profile', authMiddleware, userRouter);

app.use(errorMiddleware);

app.listen(PORT, () => console.log('Server is running'));
