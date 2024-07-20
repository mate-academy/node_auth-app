'use strict';

const express = require('express');
const cors = require('cors');
const authRouter = require('./../routes/auth.route');
const usersRouter = require('../routes/users.route');
const { initTableUsers } = require('../models/user');
const { errorMiddleware } = require('../middlewares/errorMiddleware');
const cookieParser = require('cookie-parser');
const { initTableTokens } = require('../models/token');

const createServer = async () => {
  const server = express();

  await initTableUsers();
  await initTableTokens();

  server.use(express.json());
  server.use(cookieParser());

  server.use(
    cors({
      origin: process.env.CLIENT_HOST,
      credentials: true,
    }),
  );

  server.use('/', authRouter);
  server.use('/users', usersRouter);

  server.use(errorMiddleware);

  return server;
};

module.exports = {
  createServer,
};
