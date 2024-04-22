const { ApiError } = require('../exceptions/api.error');

const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });
  }

  res.statusCode = 500;

  // eslint-disable-next-line
  console.log(error);

  res.send({
    message: 'Server error',
  });

  next();
};

module.exports = {
  errorMiddleware,
};
