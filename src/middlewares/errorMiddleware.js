'use strict';

const { ApiError } = require('../exceptions/errors');

const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    res.status(error.status).send(({
      message: error.message,
      error: error.errors,
    }));

    return;
  }

  res.statusCode = 500;

  res.send({
    message: 'Server error',
  });
};

module.exports = {
  errorMiddleware,
};
