'use strict';
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { authRouter } from './routes/auth.router.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

const app = express();

const PORT = process.env.PORT || 5701;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(authRouter);
app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running on ', PORT);
});
