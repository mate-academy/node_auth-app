class ApiError extends Error {
  constructor(status, message, errors = {}) {
    super(message);

    this.status = status;
    this.errors = errors;
  }

  static BadRequest(message, errors) {
    return new ApiError(400, message, errors);
  }

  static Unauthorized() {
    return new ApiError(401, "User is not authorized");
  }

  static Forbidden() {
    return new ApiError(403, "User is not activated yet");
  }

  static NotFound() {
    return new ApiError(404, "Not found");
  }

  static Conflict() {
    return new ApiError(409, "Conflict in data", {
      email: "User with this email is already exist",
    });
  }
}

module.exports = ApiError;
