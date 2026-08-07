'use strict';

const { ApiError } = require('../utils/ApiError');

function errorMiddleware(error, req, res, next) {
  if (error instanceof ApiError) {
    return res.status(error.status).json({
      message: error.message,
      ...(error.details && {
        details: error.details,
      }),
    });
  }

  // eslint-disable-next-line no-console
  console.error(error);

  return res.status(500).json({
    message: 'Internal server error',
  });
}

module.exports = {
  errorMiddleware,
};
