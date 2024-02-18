/* eslint strict: "warn" */
/* eslint no-console: "warn" */
'use strict';

import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';

import { authRouter } from './routes/authRouter.js';
import { userRouter } from './routes/userRouter.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

const app = express();
const PORT = process.env.PORT || 3005;
const serverRunInfo = `
Server is running on PORT=${PORT}
origin: ${process.env.CLIENT_URL}
`;

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(authRouter);
app.use('/users', userRouter);
app.use(errorMiddleware);

app.use('/', (req, res) => {
  console.info(`app.use('/'`);

  res.status(200)
    .send(serverRunInfo);
});

app.listen(PORT, () => {
  console.info(serverRunInfo);
});
