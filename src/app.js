import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRouter from './routers/auth.router.js';
import userRouter from './routers/user.router.js';
import { errorHandler } from './middlewares/errorHandler.js';
import corsOptions from './config/cors.js';

const app = express();

app.use(helmet());

app.use('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use(express.json({ limit: '10kb' }));
app.use(cors(corsOptions));
app.use(cookieParser());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);

app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.use(errorHandler);

export default app;
