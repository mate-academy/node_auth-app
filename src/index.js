/* eslint-disable no-console */
'use strict';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import errorMiddleware from './middlewares/errorMiddleware.js';
import { userRouter } from './routes/user.route.js';
import { authRouter } from './routes/auth.route.js';

const app = express();

app.use(express.json());

app.use(cookieParser());

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  }),
);

app.use(authRouter);
app.use('/users', userRouter);

app.get('/', (req, res) => {
  res.send('hello');
});

app.use(errorMiddleware);

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
