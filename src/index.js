/* eslint-disable no-console */
'use strict';

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { authRouter } = require('./routes/auth.route.js');
const { userRouter } = require('./routes/user.route.js');
const { authMiddleware } = require('./middlewares/authMiddleware.js');
const { errorMiddleware } = require('./middlewares/errorMiddleware.js');

require('dotenv').config();

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use(authRouter);
app.use('/user', authMiddleware, userRouter);

app.use('/', (req, res) => {
  res.sendStatus(404);
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log('Server is running on port: ', PORT);
});
