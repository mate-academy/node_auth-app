export function errorMiddleware(err, req, res, next) {
  const status = Number(err.status) || 500;

  const body = {
    message: err.message || 'Internal Server Error',
  };

  if (err.errors) {
    body.errors = err.errors;
  }

  if (process.env.NODE_ENV !== 'production') {
    body.stack = err.stack;
  }

  res.status(status).json(body);
}
