export class ApiError extends Error {
  constructor({ massage, status, errors = {} }) {
    super(massage);

    this.status = status;
    this.errors = errors;
  }

  static badRequest(massage, errors) {
    return new ApiError({
      massage,
      errors,
      status: 400,
    });
  }

  static unauthorized(errors) {
    return new ApiError({
      massage: 'unauthorized user',
      errors,
      status: 401,
    });
  }

  static notFound(errors) {
    return new ApiError({
      massage: 'not found',
      errors,
      status: 404,
    });
  }
}
