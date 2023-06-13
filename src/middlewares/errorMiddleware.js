'use strict';

const { ApiError } = require('../exceptions/apiError');

// eslint-disable-next-line handle-callback-err
const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    const { status, message, errors } = error;

    res.status(status).send({ message, errors });

    return;
  }
  res.status(500).send({ message: 'Unexpected error' });
};

module.exports = { errorMiddleware };
