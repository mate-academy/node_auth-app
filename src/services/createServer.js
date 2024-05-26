'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const { errorHandler } = require('../middleware/errorHandler.js');
const registerRoutes = require('../routes/index.js');

function createServer() {
  const app = express();

  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  registerRoutes(app);

  app.use(errorHandler);

  return app;
}

module.exports.createServer = createServer;
