'use strict';

const ApplicationErrors = require('../../exceptions/application.errors');

function errorMiddleware(error, req, res) {
  if (error instanceof ApplicationErrors) {
    const { status, message, errors } = error;

    res.status(status).send({
      message, errors,
    });
  }

  return res.status(500).send({ message: 'Unexpected error' });
}

module.exports = errorMiddleware;
