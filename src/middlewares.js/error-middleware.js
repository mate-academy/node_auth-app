/* eslint-disable handle-callback-err */
export const errorMiddleware = (error, req, res, next) => {
  const status = error?.status || 500;
  const message = error?.message || 'Something went wrong';
  const errors = error?.errors || null;

  res.status(status).json({
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  });
};
