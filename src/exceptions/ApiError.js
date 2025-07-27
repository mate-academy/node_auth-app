class ApiError extends Error {
  constructor({ message, status, errors = {} }) {
    super(message);

    this.status = status;
    this.errors = errors;
  }

  static badRequest(message, errors) {
    return new ApiError({
      message,
      status: 400,
      errors,
    });
  }

  static unauthorized(errors) {
    return new ApiError({
      message: 'Unauthorized user',
      status: 401,
      errors,
    });
  }

  static notFound(errors) {
    return new ApiError({
      message: 'Not found',
      status: 404,
      errors,
    });
  }

  static internal(message = 'Internal server error', errors) {
    return new ApiError({
      message,
      status: 500,
      errors,
    });
  }
}

module.exports = { ApiError };
