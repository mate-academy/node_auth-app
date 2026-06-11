import express, { type Request, type Response } from 'express';
import 'dotenv/config';
import cors from 'cors';
import { authRouter } from './routes/auth.route.js';
import { userRouter } from './routes/user.route.js';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

const app = express();
const port = process.env.PORT || 3002;
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

app.use(authRouter);
app.use('/users', userRouter);
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`server running on localhost:${port}`);
});
