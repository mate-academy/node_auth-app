'use strict';

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routers/auth.router.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import cookieParser from 'cookie-parser';
import { ApiError } from './exceptions/api.error.js';

const PORT = process.env.PORT || 8080;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use('/auth', authRouter);

app.use((req, res, next) => {
  next(ApiError.notFound({ route: req.originalUrl }));
});

app.use(errorMiddleware);

app.listen(PORT, () => {});
