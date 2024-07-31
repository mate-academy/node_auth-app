'use strict';

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.route.js';
import { userRouter } from './routes/user.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import cookieParser from 'cookie-parser';

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
app.use(authRouter);
app.use('/users', userRouter);
app.use((req, res, next) => {
  res.status(404).send('Page Not Found');
});
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
