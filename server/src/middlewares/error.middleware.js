const ApiError = require("../exceptions/ApiError.js");

function errorMiddleware(error, req, res, next) {
  if (error instanceof ApiError) {
    const { status, message, errors } = error;

    res.status(status).send({ message, errors });
    return;
  }

  console.log(error);

  res.status(500).send({
    message: "Unexpected internal server error",
  });
}

module.exports = errorMiddleware;
