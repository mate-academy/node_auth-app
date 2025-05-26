/* eslint-disable no-console */
'use strict';

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.route.js';
import { userRouter } from './routes/user.route.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';
import { client } from './utils/db.js';

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

app.get('/', (req, res) => {
  res.send('Hello');
});

app.use(errorMiddleware);

client.sync({ alter: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server run on PORT ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to sync DB:', err);
  });
