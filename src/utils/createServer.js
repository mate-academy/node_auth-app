const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { errorMiddleware } = require('../middlewares/errorMiddleware');
const { initUsersTable } = require('../models/user');
const { initTokensTable } = require('../models/token');
const { authRouter } = require('../routes/auth.route');
const { usersRouter } = require('../routes/users.route');

const createServer = async () => {
  const server = express();

  await initUsersTable();
  await initTokensTable();

  server.use(
    cors({
      origin: process.env.CLIENT_HOST,
      credentials: true,
    }),
  );
  server.use(express.json());
  server.use(cookieParser());
  server.use('/', authRouter);
  server.use('/users', usersRouter);
  server.use(errorMiddleware);

  return server;
};

module.exports = { createServer };
