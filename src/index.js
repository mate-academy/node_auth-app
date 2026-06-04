'use strict';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.route.ts';
import { usersRouter } from './routes/users.route.ts';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use('/auth', authRouter);
app.use('/users', usersRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
