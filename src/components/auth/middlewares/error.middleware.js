'use strict';

const ExceptionsErrors = require('../../exceptions/exceptions.errors');

function errorMiddleware(error, req, res, next) {
  if (error instanceof ExceptionsErrors) {
    const { status, message, errors } = error;

    res.status(status).send({
      message, errors,
    });
  }

  res.status(500).send({ message: 'Unexpected error' });
}

module.exports = errorMiddleware;
