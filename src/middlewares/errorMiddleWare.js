const { ApiError } = require('../exeptions/api.error.js');

const errorMiddleWare = (error, req, res, next) => {
  if (error instanceof ApiError) {
    return res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });
  }

  res.status(500).send({
    message: 'Internal server error',
  });
};

module.exports = { errorMiddleWare };
