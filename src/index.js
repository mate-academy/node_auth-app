/* eslint-disable no-console */
'use strict';

import express from 'express';
import 'dotenv/config';
import { authRouter } from './routes/auth.route.js';
// import { Sequelize } from 'sequelize';
// import { client } from './utils/db.js';
import cors from 'cors';
import { userRouter } from './routes/user.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use('/auth', authRouter);
app.use('/users', userRouter);

app.use(errorMiddleware);

app.get('/', (req, res) => {
  res.send('Hello');
});

app.listen(PORT, () => {
  console.log(`server is running on PORT: ${process.env.PORT}`);
});
