import { ApiError } from "../exceptions/api.error.js";

export const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    return res.status(error.status).send({
      message: error.message,
      errors: error.errors
    })
  }

  if (error) {
    res.statusCode = 500;
    return res.send({
      message: 'Server error'
    })
  }

  next();
}