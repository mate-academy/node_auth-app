'use strict';
import 'dotenv/config';
import express from 'express';
import { authRouter } from './routes/auth.route.js';
import cors from 'cors';
import { userRouter } from './routes/user.route.js';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);
app.use(authRouter);
app.use('/users', userRouter);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
});
