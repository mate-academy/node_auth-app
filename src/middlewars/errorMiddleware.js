const { ApiError } = require('../exeptions/apiError');

const errorMiddleware = (err, req, res, next) => {
  if (err instanceof ApiError) {
    res.statusCode = err.status;

    res.send({
      message: err.message,
      errors: err.errors,
    });

    return;
  }

  res.statusCode = 500;
  res.send({ message: 'Server error', error: err.message });
};

module.exports = {
  errorMiddleware,
};
