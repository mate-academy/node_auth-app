'use strict';

const errorViews = require('../views/errorViews');
const logger = require('../utils/logger');

function notFound(req, res) {
  res.page(404, errorViews.notFound(res.locals));
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error);

    return;
  }

  logger.logError(error.stack || error);
  res.status(500).type('html').send(errorViews.serverError(res.locals));
}

module.exports = {
  notFound,
  errorHandler,
};
