const { ApiError } = require('../exeptions/api.error.js');

const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ message: err.message, errors: err.errors });
  }

  return res.status(500).send({ message: 'Unexpected error' });
};

module.exports = { errorMiddleware };
