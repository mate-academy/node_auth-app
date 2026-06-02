'use strict';

import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.router.js';
import { userRouter } from './routes/user.router.js';
import { errorMiddleware } from './middlewares/errorMiddlewares.js';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(authRouter);
app.use(userRouter);
app.use(errorMiddleware);

app.use((req, res) => {
  res.status(404).send({ message: 'Route not found' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
});
