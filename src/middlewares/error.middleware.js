/* eslint-disable no-console */
'use strict';

const { ApiError } = require('../utils/api.error');

const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    const { status, message, errors } = error;

    res.status(status).send({
      message,
      errors,
    });

    return;
  }

  res.status(500).send({ message: 'Something went wrong' });
};

exports.errorMiddleware = errorMiddleware;
