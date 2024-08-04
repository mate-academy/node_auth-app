import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.route.js';
import { userRouter } from './routes/user.route.js';
import { errorMiddleware, notFoundMiddleware } from './middlewares/errorMiddleware.js';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(cors({
  origin: process.env.CLIENT_HOST,
  credentials: true,
}));

app.options('*', cors({
  origin: process.env.CLIENT_HOST,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(authRouter);
app.use('/users', userRouter);
app.use(errorMiddleware);
app.use(notFoundMiddleware);

app.get('/', (req, res) => {
  res.send('hello');
});

app.listen(PORT, () => {
  console.log('server is running on the port:', PORT);
});
