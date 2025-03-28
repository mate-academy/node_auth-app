'use strict';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.route.js';
import { userRouter } from './routes/user.route.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use(authRouter);
app.use('/users', userRouter);

app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
});
