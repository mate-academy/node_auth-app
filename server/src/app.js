'use strict';

const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');

const { env } = require('./config/env');
const { errorMiddleware } = require('./middlewares/errorMiddleware');
const { apiRouter } = require('./routes');

const app = express();

app.use(morgan(env.isProduction ? 'combined' : 'dev'));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

app.use('/api', apiRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use(errorMiddleware);

module.exports = { app };
