'use strict';

const express = require('express');
const {
  errorHandlerMiddleware,
} = require('../middleware/errorHandlerMiddleware.js');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { routeAuth } = require('../routes/routes.auth.js');
const { routeProfile } = require('../routes/routes.profile.js');
const { routeReset } = require('../routes/routes.reset.js');
const { routeChange } = require('../routes/routes.change.js');

function createServer() {
  const app = express();

  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.use('/', routeAuth);
  app.use('/profile/', routeProfile);
  app.use('/reset/', routeReset);
  app.use('/profile/change/', routeChange);

  app.use(errorHandlerMiddleware);

  return app;
}

// path
// ./; /activate/:activationToken; /login; /sign-in

module.exports.createServer = createServer;
