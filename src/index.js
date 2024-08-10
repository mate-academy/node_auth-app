'use strict';

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { errorMiddleware } = require('./middlewares/error.middleware');
const userRouter = require('./routes/user.route');
const authRouter = require('./routes/auth.route');
const { unknownEndpoint } = require('./middlewares/helper.middleware');
const { authMiddleware } = require('./middlewares/auth.middleware');

require('dotenv').config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use('/', authRouter);
app.use('/users', authMiddleware, userRouter);
app.use(unknownEndpoint);
app.use(errorMiddleware);

/* eslint-disable no-console */
app.listen(process.env.PORT, () => {
  console.log(`Server has started on port:${process.env.PORT || 5000}`);
});
