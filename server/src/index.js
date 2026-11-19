import 'dotenv/config';
import express from 'express';
import { authRouter } from './routes/auth.route.js';
import cors from 'cors';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { userRouter } from './routes/user.route.js';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT || 3004;

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_HOST,
  credentials: true,
}));

app.use(cookieParser());

app.use(authRouter);
app.use('/users', userRouter);

app.get('/', (req, res) => {
  res.send('Hello');
})

app.use(errorMiddleware);
app.listen(PORT, () => {
  console.log('Server is running');
});
