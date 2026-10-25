'use strict';

const path = require('path');
const express = require('express');
const config = require('./config');
const securityHeaders = require('./middlewares/security');
const sessionConfig = require('./middlewares/session');
const loadCurrentUser = require('./middlewares/currentUser');
const viewLocals = require('./middlewares/viewLocals');
const csrfProtection = require('./middlewares/csrf');
const errorHandlers = require('./middlewares/errorHandlers');
const asyncHandler = require('./utils/asyncHandler');
const routes = require('./routes');

function createApp() {
  const app = express();
  const publicDir = path.join(__dirname, 'public');
  const urlencoded = express.urlencoded({ extended: false, limit: '10kb' });

  app.disable('x-powered-by');

  if (config.trustProxy) {
    app.set('trust proxy', 1);
  }

  app.use(express.static(publicDir));
  app.use(securityHeaders);
  app.use(urlencoded);
  app.use(sessionConfig.sessionMiddleware);
  app.use(asyncHandler(loadCurrentUser));
  app.use(viewLocals);
  app.use(csrfProtection);
  app.use(routes);
  app.use(errorHandlers.notFound);
  app.use(errorHandlers.errorHandler);

  return app;
}

module.exports = createApp;
