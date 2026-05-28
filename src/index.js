/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
'use strict';

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authrouter } from './routes/auth.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { profilerouter } from './routes/profile.route.profile.js';
import { passwordResetrouter } from './routes/passwordReset.route.js';

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use(authrouter);
app.use(passwordResetrouter);
app.use('/profile', profilerouter);
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log('Server is runing');
});
