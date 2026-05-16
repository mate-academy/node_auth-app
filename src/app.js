import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.route.js';
import { userRouter } from './routes/user.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import cookieParse from 'cookie-parser';

const PORT = process.env.PORT || 3005;

export const app = express();
app.use(express.json());
app.use(cookieParse());

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);
app.use(authRouter);

app.use('/', userRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});
app.use(errorMiddleware);
app.listen(PORT);
