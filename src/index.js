/* eslint-disable no-console */
'use strict';

const express = require('express');

require('dotenv').config();

const cors = require('cors');
const cookieParser = require('cookie-parser');

const { authRoute } = require('./routes/auth.route');
const { userRouter } = require('./routes/user.route');
const { errorMiddleware } = require('./middlewares/errorMiddleware');

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

app.use(authRoute);
app.use(userRouter);

app.use((req, res) => {
  res.status(404).send({ message: 'Route not found' });
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log('Server is started on http://localhost:3005');
});
