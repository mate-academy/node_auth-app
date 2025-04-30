type Errors = Record<string, string | undefined> | undefined;

interface ApiErrorParams {
  message: string;
  status: number;
  errors?: Errors;
}

export class ApiError extends Error {
  status: number;
  errors: Errors;

  constructor({ message, status, errors }: ApiErrorParams) {
    super(message);

    this.status = status;
    this.errors = errors;

    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string, errors?: Errors) {
    return new ApiError({
      message,
      status: 400,
      ...(errors && { errors }),
    });
  }

  static unauthorized(message: string, errors?: Errors) {
    return new ApiError({
      message,
      status: 401,
      ...(errors && { errors }),
    });
  }

  static notFound(errors?: Errors) {
    return new ApiError({
      message: 'Not Found',
      status: 404,
      ...(errors && { errors }),
    });
  }
}
