'use strict';
import 'dotenv/config';
import express from 'express';
import { userRouter } from './routes/user.route.js';
import { authRouter } from './routes/auth.route.js';

const PORT = process.env.PORT;

const app = express();

app.use(express.json());

app.use('/users', userRouter);
app.use(authRouter);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`server running on ${PORT}`);
});
