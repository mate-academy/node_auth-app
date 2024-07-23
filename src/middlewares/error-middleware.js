const { ApiError } = require('../exceptions/API-error.js');

const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    const { status, message, errors } = error;

    res.status(status).send({ message, errors });

    return;
  }

  res.status(500).send({ message: error.message });
};

module.exports = {
  errorMiddleware,
};
