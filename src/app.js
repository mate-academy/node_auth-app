import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './routes/auth.routes.js';

const app = express();

app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use('/api', authRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Маршрут не знайдено (404)' });
});

export default app;
