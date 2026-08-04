'use strict';

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { authRouter } from './routes/auth.route.js';
import { userRouter } from './routes/user.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { client } from './utils/db.js';

import './models/user.js';
import './models/token.js';

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

app.use('/auth', authRouter);
app.use('/users', userRouter);

app.get('/', (req, res) => {
  res.send({
    message: 'Auth API is working',
  });
});

app.use((req, res) => {
  res.status(404).send({
    message: 'Page not found',
  });
});

app.use(errorMiddleware);

async function startServer() {
  await client.authenticate();
  await client.sync({ alter: true });

  app.listen(PORT);
}

startServer();
