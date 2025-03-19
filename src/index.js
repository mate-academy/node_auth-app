'use strict';

import express from 'express';
import 'dotenv/config';
import { authRouter } from './routes/auth.router.js';
import { userRouter } from './routes/user.router.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT || 4000;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(authRouter);
app.use('/users', userRouter);
app.use(errorMiddleware);

// eslint-disable-next-line no-console
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
