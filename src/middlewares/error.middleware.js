export const errorMiddleware = (error, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(error.stack);

  res.status(500).json({
    message: 'Internal Server Error',
  });
};
