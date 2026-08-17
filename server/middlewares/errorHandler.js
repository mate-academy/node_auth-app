import ApiError from '../utils/ApiError.js';

export const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: err.message });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ message: 'This email is already in use' });
  }

  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(status).json({ message });
};

export default errorHandler;
