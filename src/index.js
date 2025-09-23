'use strict';
import 'dotenv/config';
import express from 'express';
import { authRouter } from './routes/auth.route.js';
import cors from 'cors';
import { userRouter } from './routes/user.route.js';
import { errorMidleware } from './middlewares/errorMiddleware.js';
import cookieParser from 'cookie-parser';

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
  res.send('Klim rachina!');
});

app.use(errorMidleware);

app.listen(PORT, () => {
  console.log(`Стартуем Ёкарный бабай! На ${PORT} порте`);
});
