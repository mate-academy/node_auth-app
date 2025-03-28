class ApiError extends Error {
  constructor({ message, status, errors = {} }) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static badRequest = (message, errors) =>
    new ApiError({
      message,
      errors,
      status: 400,
    });

  static unauthorized = (errors) =>
    new ApiError({
      message: 'unauthorized user',
      errors,
      status: 401,
    });

  static notFound = (errors) =>
    new ApiError({
      message: 'not found',
      errors,
      status: 404,
    });
}
module.exports = { ApiError };
