'use strict';

const { ApiError } = require('../exeption/apiError.js');

const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    res.status(error.status).send({
      massage: error.message,
      errors: error.errors,
    });
  }

  if (error) {
    res.status(500).send({
      messade: 'Server error',
    });
  }

  next();
};

module.exports = {
  errorMiddleware,
};
