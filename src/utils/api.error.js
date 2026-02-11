export class ApiError extends Error {
  constructor({ message, status, errors = {} }) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static badRequest(message = 'Bad Request', errors = {}) {
    return new ApiError({ message, status: 400, errors });
  }

  static unauthorized() {
    return new ApiError({ message: 'Unauthorized', status: 401 });
  }

  static forbidden() {
    return new ApiError({ message: 'Forbidden', status: 403 });
  }

  static notFound() {
    return new ApiError({ message: 'Not Found', status: 404 });
  }

  static internal() {
    return new ApiError({ message: 'Internal Server Error', status: 500 });
  }
}
