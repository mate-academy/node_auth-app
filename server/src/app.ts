import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { healthRouter } from './routes/health.route';
import { notFoundMiddleware } from './middlewares/notFoundMiddleware';
import { errorMiddleware } from './middlewares/errorMiddleware';
import { authRouter } from './routes/auth.route';
import { profileRouter } from './routes/profile.route';

export const app = express();

app.use(cors({ origin: env.clientHost, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// routes
app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/profile', profileRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
