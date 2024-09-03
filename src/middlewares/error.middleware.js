const { ApiError } = require('../exceptions/api.error');

const errorMiddleware = (error, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(error);

  if (error instanceof ApiError) {
    res.statusCode = error.status;

    res.send({
      message: error.message,
      errors: error.errors,
    });

    return;
  }

  res.statusCode = 500;

  res.send({
    message: 'Server error',
  });
};

module.exports = {
  errorMiddleware,
};
