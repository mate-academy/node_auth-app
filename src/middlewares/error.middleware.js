const AppError = require('../utils/appError');

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // eslint-disable-next-line no-console
  console.error('Unexpected error:', err);

  return res.status(500).json({ error: 'Internal server error' });
}

module.exports = errorHandler;
