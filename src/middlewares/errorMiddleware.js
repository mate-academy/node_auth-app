import ApiError from '../exeptions/api.error.js';

const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    return res
      .status(error.status)
      .json({ message: JSON.parse(error.message) });
  }

  if (error) {
    return res.status(500).json({ message: 'Something went wrong' });
  }

  next();
};

export default errorMiddleware;
