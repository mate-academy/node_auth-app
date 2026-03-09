export function errorMiddleware(err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
}
