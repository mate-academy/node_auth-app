/* eslint-disable no-console */
'use strict';

const { ApiError } = require('../exceptions/ApiError');

function errorMiddleware(error, req, res, next) {
  if (error instanceof ApiError) {
    const { status, message, errors } = error;

    res.status(status);

    res.send({
      message, errors,
    });

    return;
  }

  console.log(error);

  res.status(500).send({
    message: 'Unexpected error',
  });
}

module.exports = { errorMiddleware };
