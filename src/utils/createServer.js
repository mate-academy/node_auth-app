'use strict';

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { authRouter } = require('../routes/auth.router');
const { usersRouter } = require('../routes/users.router');

dotenv.config();

const createServer = () => {
  const app = express();

  app.use(express.json());

  app.use(
    cors({
      credentials: true,
      origin: process.env.CLIENT_HOST,
    }),
  );

  app.use('/auth', authRouter);
  app.use('/users', usersRouter);

  return app;
};

module.exports = {
  createServer,
};
