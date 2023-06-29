'use strict';

const { ApiError } = require('../exceptions/ApiError.js');

function errorMiddleware(error, req, res, next) {
  if (error instanceof ApiError) {
    const { status, message, errors } = error;

    return res.status(status).send({
      message,
      errors,
    });
  }

  res.status(500).send({
    message: error.message,
  });
}

module.exports = {
  errorMiddleware,
};
