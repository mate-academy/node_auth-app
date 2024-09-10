'use strict';

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const usersRouter = require('./routes/users.route.js');
const authRouter = require('./routes/authentication.route.js');
const {
  errorMiddleware,
  notFoundMiddleware,
} = require('./middlewares/errorMiddleware.js');

function createServer() {
  const app = express();

  app.use(express.json());

  app.use(
    cors({
      origin: process.env.CLIENT_HOST,
      credentials: true,
    }),
  );

  app.options(
    '*',
    cors({
      origin: process.env.CLIENT_HOST,
      credentials: true,
    }),
  );

  app.use(cookieParser());

  app.use(authRouter);
  app.use('/users', usersRouter);
  app.use(errorMiddleware);
  app.use(notFoundMiddleware);

  app.get('/', (req, res) => {
    res.send('hello');
  });

  return app;
}

module.exports = {
  createServer,
};
