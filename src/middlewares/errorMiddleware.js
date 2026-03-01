export const errorMiddleware = (error, req, res, next) => {
  if (error instanceof Error) {
    res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });
  }

  if (error) {
    res.status(500).send({ message: 'Server error' });
  }

  next();
};
