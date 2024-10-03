'use strict';

import cookieParser from 'cookie-parser';
import express from 'express';
import 'dotenv/config';
import cors from 'cors';

import { authRouter } from './routes/auth.route.js';
import { userRouter } from './routes/user.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(authRouter);
// '!!!'
app.use('/users', userRouter);
app.use(errorMiddleware);

// app.get('/', (req, res) => {
//   res.send('Hello');
// });

app.listen(PORT);
