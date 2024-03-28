'use strict';

const { ErrorMessages } = require('../enums/enums.js');
const { ApiError } = require('../exceptions/api-error.js');

const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    const { status, message, errors } = error;

    res.status(status).send({
      message, errors,
    });

    return;
  }

  res.status(500).send({
    message: `${ErrorMessages.UNEXPECTED} ${error}`,
  });
};

module.exports = {
  errorMiddleware,
};
