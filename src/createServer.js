'use strict';

const express = require('express');
const { router: authRoutes } = require('./auth/auth.route');
const { router: userRoutes } = require('./users/user.route');
const errorHandler = require('./middlewares/error.middleware');
const { authMiddleware } = require('./middlewares/auth');

function createServer() {
  const app = express();

  app.use(express.json());

  app.use('/auth', authRoutes);

  app.use('/users', authMiddleware, userRoutes);

  app.use(errorHandler);

  return app;
}

module.exports = {
  createServer,
};
