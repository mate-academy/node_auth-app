'use strict';

const { authRoutes } = require('./routes/auth-routes');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const createServer = () => {
  const express = require('express');
  const server = express();

  server.use(express.json());
  server.use(cookieParser());

  server.use(
    cors({
      origin: 'http://localhost:5173',
      credentials: true,
    }),
  );
  server.use('/', authRoutes);

  return server;
};

if (require.main === module) {
  createServer().listen(3000);
}

module.exports = {
  createServer,
};
