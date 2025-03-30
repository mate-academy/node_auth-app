'use strict';

import cookieParser from 'cookie-parser';
import 'dotenv/config';
import express from 'express';
import 'express-async-errors';
import configs from './configs/index.config.js';
import authRouter from './routers/auth.router.js';
import userRouter from './routers/user.router.js';
import './sync.js';

const app = express();

app.use(express.json());
app.use(configs.cors);
app.use(cookieParser());
app.use('/users', userRouter);
app.use('/auth', authRouter);
app.use(configs.asyncError);

app.listen(process.env.EXPRESS_PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Server running');
});
