'use strict';
import express from 'express';
import 'dotenv/config';
import { authRouter } from './routes/auth.route.js';
import cors from 'cors';
import { userRouter } from './routes/user.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT || 3000;

const app = express(); // create web-server

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  // use cors to enter from different url
  origin: process.env.CLIENT_HOST,
  credentials: true,
}));

app.use(authRouter); // connecting authroutes
app.use('/users', userRouter);

app.get('/', (req, res) => {
  res.send('Hello');
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
});

