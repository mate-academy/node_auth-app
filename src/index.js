/* eslint-disable no-console */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { authRouter } from './routes/authRouter.js';
import { userRouter } from './routes/userRouter.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use(authRouter);
app.use('/update', userRouter);

app.use(errorMiddleware);

app.listen(PORT, () => console.log(`Server starting in ${PORT} port`));
