'use strict';

import cors from 'cors';
import express from 'express';
import 'dotenv/config';
import { authRouter } from './routes/auth.route.js';
import { userRouter } from './routes/user.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(errorMiddleware);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(authRouter);
app.use('/users', userRouter);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Server started at http://localhost:3005');
});
