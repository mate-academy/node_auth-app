import { ApiError } from "../exceptions/api.error.js";

export const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    res.status(error.status);
    res.send({ message: error.message, errors: error.errors });
  }

  if (error) {
    res.status(500);
    res.send({ message: error.message });
  }

  next();
};
