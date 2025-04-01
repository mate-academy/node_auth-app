const { ApiError } = require('../exceptions/apiError');

const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    return res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });
  }

  res.statusCode = 500;
  res.send({ message: 'Server Error' });
};

module.exports = {
  errorMiddleware,
};
