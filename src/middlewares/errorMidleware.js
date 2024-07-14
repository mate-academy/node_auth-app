import { ApiError } from "../exeptions/api.error.js"

export const errorMidleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    res.status(error.status).send({
      message: error.message,
      errors: error.errors
    })
  }

  if (error) {
    console.error("Error during registration:", error);
    res.statusCode = 500;
    res.send({
      message: 'Server error', error
    })
  }

  next()
}
