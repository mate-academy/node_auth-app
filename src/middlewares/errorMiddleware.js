const { ApiError } = require('../exceptions/api.error.js');

const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });
  } else {
    res.statusCode = 500;

    res.send({
      message: 'Server error 1',
    });
  }

  next();
};

module.exports = { errorMiddleware };
