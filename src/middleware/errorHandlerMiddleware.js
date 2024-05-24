'use strict';

const { ApiError } = require('../exeptions/api.error.js');

async function errorHandlerMiddleware(error, req, res, next) {
  if (error instanceof ApiError) {
    res.status(error.status).json(error.message);

    return;
  }

  res.status(500).json({ message: 'Internal server error' });
}

module.exports = {
  errorHandlerMiddleware,
};
