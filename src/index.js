'use strict';

import 'dotenv/config.js'
import cors from 'cors';
import express from 'express';
import { authRouter } from './routes/auth.route.js';
import { usersRouter } from "./routes/users.route.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: process.env.CLIENT_HOST,
  credentials: true,
}));

app.use(authRouter);
app.use('/users', usersRouter);

app.use(errorMiddleware);


app.listen(PORT, () => {
  console.log(`Server is running on 'http://localhost:${PORT}'`);
});
