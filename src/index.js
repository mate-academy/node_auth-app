'use strict';

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initDb } from './models/index.js';
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie_secret_change_me'));
app.use('/auth', authRouter);
app.use('/user', userRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      process.stdout.write(`Server is running on http://localhost:${PORT}\n`);
    });
  })
  .catch((error) => {
    process.stderr.write(
      `Database initialization failed: ${error.message || error}\n`,
    );
    process.exit(1);
  });
