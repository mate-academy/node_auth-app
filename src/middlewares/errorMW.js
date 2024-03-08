'use strict';

const { ErrorApi } = require('../exceptions/ErrorApi.js');

function errorMW(error, req, res, next) {
  if (error instanceof ErrorApi) {
    const { status, message, errors } = error;

    return res.status(status).send({
      message, errors,
    });
  }

  res.status(500).send({
    message: 'Unexpected error',
  });
}

module.exports = { errorMW };
