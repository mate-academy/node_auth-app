'use strict';

const { ApiError } = require('../exceptions/ApiError.js');

function errorMiddleware(error, req, res) {
  if (error instanceof ApiError) {
    const { status, message, errors } = error;

    res.status(status).send({
      message, errors,
    });

    return;
  }

  res.status(500).send({
    message: 'Internal server error',
  });
}

module.exports = {
  errorMiddleware,
};
