'use strict';

const express = require('express');
const userRouter = require('./router/user.router.js');
const authRouter = require('./router/auth.router.js');
const cookieParser = require('cookie-parser');

const createServer = () => {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  app.use('/user', userRouter);
  app.use('/', authRouter);

  app.use('*', (req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  return app;
};

module.exports = {
  createServer,
};
