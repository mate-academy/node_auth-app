class ApiError extends Error {
  constructor({ status, message, errors = {} }) {
    super(JSON.stringify(message));

    this.status = status;
    this.errors = errors;
  }

  static badRequest(message, errors) {
    return new ApiError({
      message,
      errors,
      status: 400,
    });
  }

  static unauthorized(errors) {
    return new ApiError({
      message: 'Unauthorized',
      errors,
      status: 401,
    });
  }

  static forbidden(errors) {
    return new ApiError({
      message: 'Forbidden',
      errors,
      status: 403,
    });
  }

  static notFound(message = 'Not Found', errors) {
    return new ApiError({
      message,
      errors,
      status: 404,
    });
  }
}

export default ApiError;
