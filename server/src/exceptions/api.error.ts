type ApiErrorOptions = {
  message: string;
  status: number;
  errors?: Record<string, string>;
};

export class ApiError extends Error {
  status: number;
  errors: Record<string, string>;

  constructor({message, status, errors = {}}: ApiErrorOptions) {
    super(message);

    this.status = status;
    this.errors = errors;
  }

  static BadRequest(message: string, errors = {}) {
    return new ApiError({
      message,
      status: 400,
      errors
    });
  }

  static Unauthorized(errors = {}) {
    return new ApiError({
      message: "Unauthorized user",
      status: 401,
      errors
    });
  }

  static NotFound(message: string, errors = {}) {
    return new ApiError({
      message,
      status: 404,
      errors
    });
  }

  static Forbidden(message = 'Forbidden') {
    return new ApiError({
      message,
      status: 403,
    });
  }
}
