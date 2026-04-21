const { ApiError } = require('../exceptions');

const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    const { status, message, errors } = error;

    res.status(status).send({ message, errors });

    return;
  }

  // eslint-disable-next-line no-console
  console.error(error);
  res.status(500).send({ message: 'Server Error' });
};

module.exports = errorMiddleware;
