'use strict';
import express from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import { authRouter } from './routes/auth.route.js';
import { userRouter } from './routes/user.route.js';
import { errorMidleware } from './middlewares/error.midleware.js';
import { authMiddleware } from './middlewares/auth.middleware.js';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT;

const app = express();

app.use(cors({
  origin: process.env.CLIENT_HOST,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());


app.use('/auth', authRouter);
app.use('/users', authMiddleware, userRouter);


app.use(errorMidleware);

app.all('/', (req, res) => {
  res.status(404).json({ message: 'Page not found' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${PORT}`);
});
