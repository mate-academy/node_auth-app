const ApiError = require('../exeptions/api.error');

const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    const { status, message, errors } = error;

    res.status(status).send({ message, errors });

    return;
  }

  res.status(500).send({
    message: 'Unexpected error',
  });
};

const notFoundMiddleware = (req, res, next) => {
  res.status(404).send({ message: 'Page not found' });
};

module.exports = {
  errorMiddleware,
  notFoundMiddleware,
};
