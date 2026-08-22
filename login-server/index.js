'use strict';

import 'dotenv/config';

import express from 'express';
import { authRouter } from './src/routes/auth.route.js';
import cors from 'cors';
import { userRouter } from './src/routes/user.route.js';
import { errorMiddleware } from './src/middlewares/error.middleware.js';

const PORT = process.env.PORT || 3004;

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);
app.use('/api', authRouter);
app.use('/users', userRouter);

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log('Server is running');
});
