'use strict';
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { router as authRouter } from './routes/auth.route.js';
import { router as profileRouter } from './routes/profile.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT;
const SERVER_URL = process.env.SERVER_URL;

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    methods: '*',
    allowedHeaders: '*',
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use('/', authRouter);
app.use('/profile', profileRouter);

app.use((req, res, next) => {
  res
    .status(404)
    .send(
      `What do you mean ${req.host + req.originalUrl}??? it is does not exist`,
    );
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`server run on port: ${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`full server url: ${SERVER_URL}${PORT}`);
});
