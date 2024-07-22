'use strict';

import express from 'express';
import cors from 'cors';
import { authRouter } from './routers/auth-router.js';
import { usersRouter } from './routers/users-router.js';
import { errorMiddleware } from './middlewares/error-middleware.js';
import cookieParser from 'cookie-parser';
import { sequelize } from './utils/db.js';

const PORT = process.env.PORT || 5500;

const app = express();

app.use(
  cors({
    origin: process.env.REACT_APP_ORIGIN,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(authRouter);
app.use(usersRouter);
app.use(errorMiddleware);

app.get('/', express.json(), (req, res) => {
  res.send('Helo');
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
