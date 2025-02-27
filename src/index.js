'use strict';

import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.route.js';
import { userRouter } from './routes/user.route.js';
import { errorMiddleware } from './middlewares/errorMidleware.js';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(authRouter);
app.use('/users', userRouter);
app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is ranning at http://localhost:${PORT}`);
});
