'use strict';
import 'dotenv/config';
import express from 'express';
import { authRouter } from './routes/auth.route.js';
import { userRouter } from './routes/user.route.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import cookieParser from 'cookie-parser';
import { profileRouter } from './routes/profile.router.js';
import { catchError } from './utils/catchError.js';
import { authMiddleware } from './middleware/auth.middleware.js';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(authRouter);
app.use('/users', userRouter);
app.use('/profile', catchError(authMiddleware), profileRouter);

app.use((req, res) => {
  res.sendStatus(404);
});

app.use(errorMiddleware);

app.listen(PORT, () => {});
