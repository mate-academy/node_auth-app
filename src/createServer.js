'use strict';

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth.router');
const userRouter = require('./routes/user.router');
const errorMiddleware = require('./middlewares/error.middleware');

function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  app.use(authRouter);
  app.use(userRouter);

  app.use(errorMiddleware);

  return app;
}

module.exports = {
  createServer,
};
