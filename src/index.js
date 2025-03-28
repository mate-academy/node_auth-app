'use strict';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.route.js';
import { profileRouter } from './routes/profile.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

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
app.use('/profile', profileRouter);

app.get('/', (req, res) => {
  res.send('Hello');
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});
