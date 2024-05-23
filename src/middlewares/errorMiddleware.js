const { ApiError } = require('../exeptions/api.error.js');

const errorMiddleware = (err, req, res, next) => {
  if (err instanceof ApiError) {
    res.status(err.status).send({
      message: err.message,
      errors: err.errors,
    });
  }

  if (err) {
    res.status(500).send(err.message);
  }

  next();
};

module.exports = { errorMiddleware };
