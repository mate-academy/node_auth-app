/* eslint-disable no-console */
import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';

import { authRouter } from './routes/auth.route.js';
import { userRouter } from './routes/user.route.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(authRouter);
app.use('/users', userRouter);

app.listen(PORT);
