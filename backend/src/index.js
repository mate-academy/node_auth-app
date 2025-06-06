'use strict';
import 'dotenv/config';
import express from 'express';
import { authRouter } from './routes/auth.route.js';
import cors from 'cors';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import cookieParser from 'cookie-parser';
import { profileRouter } from './routes/profile.route.js';
import passport from 'passport';
import { googleAuthRouter } from './routes/googleAuth.route.js';

import './config/passport.js';
import { githubAuthRouter } from './routes/github.route.js';
import { facebookAuthRouter } from './routes/facebook.route.js';

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

app.use(passport.initialize());

app.use(authRouter);
app.use('/profile', profileRouter);

app.use('/auth', googleAuthRouter);
app.use('/auth', githubAuthRouter);
app.use('/auth', facebookAuthRouter);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running');
});
