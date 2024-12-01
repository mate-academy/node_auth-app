'use strict';

const express = require('express');
const cors = require('cors');
const { authRouter } = require('./routes/auth.router.js');
const { userRouter } = require('./routes/user.router.js');
const { errorMiddleware } = require('./middlewares/errorMiddleware.js');

const createServer = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.use('/', authRouter);
  app.use('/users', userRouter);
  app.use(errorMiddleware);

  return app;
};

module.exports = { createServer };
