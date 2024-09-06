const { ApiErrors } = require('../exeptions/api.error');

const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiErrors) {
    res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });
  }

  res.statusCode = 500;

  res.send({
    message: 'Server error',
  });
};

module.exports = {
  errorMiddleware,
};
