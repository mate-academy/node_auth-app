import express from 'express';

import 'dotenv/config';

import cors from 'cors';

import cookieParser from 'cookie-parser';

import { authRouter } from './routes/auth.route.js';
import { profileRouter } from './routes/profile.route.js';
import { pasRouter } from './routes/password.route.js';

import { errorMiddleware } from './middlewares/errorMiddleware.js';

import morgan from 'morgan';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(morgan('tiny'));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());

app.use(cookieParser());

app.use(authRouter);

app.use(pasRouter);

app.use(profileRouter);

app.use(errorMiddleware);

app.use((_, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
