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
      errors,
      status: 401,
    });
  }

  static notFound(errors) {
    return new ApiError({
      message: 'Not found',
      errors,
      status: 404,
    });
  }

  static internal(message = 'Internal server error', errors) {
    return new ApiError({
      message,
      errors,
      status: 500,
    });
  }
}

module.exports = { ApiError };
