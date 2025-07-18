'use strict';
import 'dotenv/config';
import express from 'express';
import { authRouter } from './routes/auth.route.js';
import cors from 'cors';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import cookieParser from 'cookie-parser';
import { userRouter } from './routes/user.route.js';

const PORT = process.env.PORT || 3005;
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: '*',
  }),
);

app.use('/auth', authRouter);
app.use('/user', userRouter);
app.get('/', (req, res) => {
  res.send('Server is OK');
});

app.use((req, res, next) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
  });
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log('server is running');
});
