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

  // eslint-disable-next-line no-console
  console.log(error);

  res.status(500).send({
    message: 'Unexpected error',
  });
}

module.exports = {
  errorMiddleware,
};
