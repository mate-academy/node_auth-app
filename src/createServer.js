'use strict';

const express = require('express');

const authRoutes = require('./routes/auth.routes');

const createServer = () => {
  const app = express();

  app.use(express.json());

  app.use('/', authRoutes);

  app.use((req, res) => {
    res.status(404).send('Not found');
  });

  return app;
};

module.exports = {
  createServer,
};
