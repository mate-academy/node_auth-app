/* eslint-disable no-console */
'use strict';

import express from 'express';
import 'dotenv/config';
import { authRouter } from './routers/auth.route.js';
import { userRouter } from './routers/user.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(authRouter);
app.use('/user', userRouter);

app.use((req, res) => {
  res.status(404).send(`
    <h1>Page not found</h1>
    `);
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log('server is running');
});
