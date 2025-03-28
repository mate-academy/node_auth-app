const { ApiError } = require('../exceptions/ApiError.js');

function errorMiddleware(error, req, res, next) {
  if (error instanceof ApiError) {
    const { status, message, errors } = error;

    res.status(status).send({ message, errors });

    return;
  }

  res.status(500).send({
    message: 'Unexpected error',
  });
}

module.exports = { errorMiddleware };
