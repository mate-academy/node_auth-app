const { ApiError } = require("../exeptions/api.error");

const errorMiddleware = (error,req, res, next) => {
  if(error instanceof ApiError) {
    res.status(error.status).send({
      meseage: error.message,
      error: error.errors,
    })

    return;
  }

  if(error) {
    res.statusCode = 500;
    res.send({
      message: 'Server error'
    })
  }

  next();
}

module.exports = {
  errorMiddleware,
}
