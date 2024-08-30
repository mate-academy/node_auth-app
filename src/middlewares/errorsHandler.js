const { ApiError } = require('../exceptions/api.error');

const errorsHandler = (error, req, res, next) => {
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
  errorsHandler,
};
