const errorMiddleware = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).send({
    message: 'Internal server error',
  });
};

module.exports = {
  errorMiddleware,
};
