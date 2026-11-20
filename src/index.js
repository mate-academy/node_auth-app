'use strict';
import express from 'express';
import 'dotenv/config';
import { authRouter } from './routes/auth.route.js';
import cors from 'cors';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

const PORT = process.env.PORT || 3004;

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);
app.use(express.json());
app.use(authRouter);

app.get('/', (req, res) => {
  res.send('Hello!');
});

// eslint-disable-next-line no-console
app.listen(PORT, () => console.log('Server is running...'));

app.use(errorMiddleware);
