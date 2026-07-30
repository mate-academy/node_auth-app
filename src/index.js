'use strict';

import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import { router } from './routes/authRouter.js';
import { router as userRouter } from './routes/userRouter.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT || 3005;
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_HOST || 'http://localhost:5173',
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(router);
app.use(userRouter);
app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('server is running');
});
