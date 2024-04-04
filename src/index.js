'use strict';

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.routes.js';
import { userRouter } from './routes/user.routes.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

const PORT = process.env.SERVER_PORT || 3002;
const server = express();

server.use(express.json());
server.use(cookieParser());
server.use(cors({
  origin: process.env.CLIENT_HOST,
  credentials: true,
}));

server.use(authRouter);
server.use(userRouter);

server.use(errorMiddleware);

server.listen(PORT, () => {
  console.log('Server is running')
})
