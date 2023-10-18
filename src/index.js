import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { authRouter } from './routes/authRouter.js';
import { userRouter } from './routes/userRouter.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use(authRouter);
app.use('/users', userRouter);

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on ${process.env.CLIENT_HOST}`);
});
