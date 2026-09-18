const { ApiError } = require('../exception/api.error');

const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    return res
      .status(error.status)
      .send({ message: error.message, error: error.errors });
  }

  if (error) {
    res.statusCode = 500;

    return res.send({
      message: 'Server error',
    });
  }

  next();
};

module.exports = { errorMiddleware };
