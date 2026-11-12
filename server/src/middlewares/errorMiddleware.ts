import { ApiError } from "../exceptions/api.error.js"

export const errorMidleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    })

    return;
  }

  res.status(500).json({
    message: 'Internal server error',
  });
}
