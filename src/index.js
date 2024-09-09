'use strict';

import cookieParser from 'cookie-parser';
import express from 'express';
import 'dotenv/config';
import { authRouter } from './routes/auth-router.js';
import cors from 'cors';
import { usersRouter } from './routes/users-router.js';
import { errorMiddleware } from './middlewares/error-middleware.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(authRouter);
app.use(usersRouter);
app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server works on http://localhost:${PORT}`);
});
