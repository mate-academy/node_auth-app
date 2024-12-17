class AuthError extends Error {
  constructor(message, status, errors = {}) {
    super(message);

    Object.assign(this, { status, errors });
  }

  static badRequest(message, errors) {
    return new AuthError(message, 400, errors);
  }

  static unauthorized(errors) {
    return new AuthError(401, 'Unauthorized', errors);
  }

  static notFound(errors) {
    return new AuthError(404, 'Not Found', errors);
  }
}

module.exports = {
  AuthError,
};
