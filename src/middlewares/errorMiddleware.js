const { ApiError } = require('../exeptions/api.errors');

const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });
  }

  res.statusCode = 500;

  res.send({
    message: 'Server error',
  });

  next();
};

module.exports = {
  errorMiddleware,
};
