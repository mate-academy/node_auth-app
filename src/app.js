import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { authRouter } from './routes/auth.js';

dotenv.config();
export const app = express();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.status(200).send('Server is running');
});

app.use('/auth', authRouter);

app.use(notFound);
app.use(errorHandler);
