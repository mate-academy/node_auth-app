'use strict';
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.route.js';
import { userRouter } from './routes/user.route.js';
import { authMiddleware } from './middlewares/auth.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());

app.use(express.json());
app.use(cookieParser());
app.use(authRouter);
app.use('/profile', authMiddleware, userRouter);
app.use(errorMiddleware);

app.listen(PORT);
