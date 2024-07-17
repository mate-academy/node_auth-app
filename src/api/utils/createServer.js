const express = require('express');
const cors = require('cors');
const { authRouter } = require('../routes/auth.route');
const { initTableUsers } = require('../models/users.model');
const { usersRouter } = require('../routes/users.route');
const { initTableTokens } = require('../models/token.model');

const createServer = () => {
  const server = express();

  initTableUsers();
  initTableTokens();

  server.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    }),
  );
  server.use(express.json());

  server.use('/auth', authRouter);
  server.use('/users', usersRouter);

  return server;
};

module.exports = {
  createServer,
};
