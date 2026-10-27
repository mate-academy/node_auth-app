'use strict';

require('dotenv/config');

const express = require('express');
const { authRouter } = require('./routes/auth.route.js');
const cors = require('cors');
const { userRouter } = require('./routes/user.route.js');
const { errorMiddleware } = require('./middleware/errorMiddleware.js');

const app = express();
const port = process.env.PORT || 3005;

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use('/', authRouter);
app.use('/', userRouter);

app.use(errorMiddleware);

app.use((req, res) => {
  res.status(404).send({ message: 'Route not found' });
});

app.listen(port, () => {});
