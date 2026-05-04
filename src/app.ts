'use strict';

import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/authRoute.js';
import { loginRouter } from './routes/loginRoute.js';
import { logoutRouter } from './routes/logoutRoute.js';
import { meRouter } from './routes/meRoute.js';
import { profileRouter } from './routes/profileRoute.js';
import { passwordResetRouter } from './routes/passwordResetRoute.js';

export const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

app.use(authRouter);
app.use(loginRouter);
app.use(logoutRouter);
app.use(meRouter);
app.use(profileRouter);
app.use(passwordResetRouter);
