'use strict';

const express = require('express');
const cors = require('cors');
const { authRouter } = require('./routes/auth.router.js');

const createServer = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.use('/', authRouter);

  return app;
};

module.exports = { createServer };
