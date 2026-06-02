export class ApiError extends Error {
  constructor(status, message, errors = {}) {
    super(message);

    this.status = status;
    this.errors = errors;
  }
  static BadRequest(message, errors) {
    return new ApiError(400, message, errors);
  }

  static Unauthorized(errors) {
    return new ApiError(401, 'User is not authorized', errors);
  }

  static NotFound(errors) {
    return new ApiError(404, 'not found', errors);
  }
}
