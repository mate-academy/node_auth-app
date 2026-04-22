'use strict';

const { ApiError } = require('../utils/ApiError');

function errorMiddleware(error, req, res, next) {
  if (error instanceof ApiError) {
    res.status(error.status).json({
      message: error.message,
      errors: error.errors,
    });

    return;
  }

  process.stderr.write(`${error}\n`);

  res.status(500).json({ message: 'Internal server error' });
}

module.exports = { errorMiddleware };
