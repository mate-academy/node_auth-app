'use strict';
import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { authRouter } from './routes/auth.route.js';
import { userRouter } from './routes/user.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { ApiError } from './exeptions/api.error.js';

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

app.use(authRouter);
app.use('/users', userRouter);

app.get('/', (req, res) => {
  res.send('Hello');
});

app.use((req, res, next) => {
  next(ApiError.notFound('Page not found'));
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
});
