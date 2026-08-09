'use strict';
import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/authRouter.js';
import { profileRouter } from './routes/profileRouter.js';
import { errorMiddleware } from './middlewares/errorMiddlware.js';
import passport from './config/passport.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

app.use(passport.initialize());

app.use(authRouter);
app.use('/profile', profileRouter);
app.use(errorMiddleware);

app.listen(PORT);
