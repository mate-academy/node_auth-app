'use strict';

function errorMiddleware(error, req, res, next) {
  const status = error.status || 500;
  const message = status === 500 ? 'Internal server error' : error.message;

  if (status === 500) {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  res.status(status).json({ message });
}

module.exports = { errorMiddleware };
