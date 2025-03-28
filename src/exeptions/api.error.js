class ApiErrors extends Error {
  constructor({ message, status, errors = {} }) {
    super(message);

    this.status = status;
    this.errors = errors;
  }

  static badRequest(message, errors) {
    return new ApiErrors({
      message,
      errors,
      status: 400,
    });
  }

  static unauthorized(errors) {
    return new ApiErrors({
      message: 'unauthorized user',
      errors,
      status: 401,
    });
  }

  static notFound(errors) {
    return new ApiErrors({
      message: 'Not found',
      errors,
      status: 401,
    });
  }
}

module.exports = {
  ApiErrors,
};
