/* eslint-disable no-console */
'use strict';

import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';

import { authRouter } from './routes/auth.route.js';
import { passwordRouter } from './routes/password.route.js';
import { profileRouter } from './routes/profile.route.js';

import { errorMiddleware } from './middlewares/errorMiddleware.js';

import './models/index.js';

import passport from './passport/passport.js';
import { client } from './utils/db.js';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use('/auth', authRouter);
app.use('/password', passwordRouter);
app.use('/profile', profileRouter);

app.use((req, res) => {
  res.status(404).send({
    message: 'Route not found',
  });
});

app.use(errorMiddleware);

async function start() {
  try {
    await client.authenticate();
    await client.sync();

    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed');
    console.error(error);
  }
}

start();
