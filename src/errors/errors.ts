import { httpStatus } from '../static/index.ts';
import type { HTTPStatus } from '../static/types/index.ts';

class RequestError extends Error {
  statusCode: HTTPStatus;

  constructor(message: string, statusCode: HTTPStatus = httpStatus.br) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

class DBError extends RequestError {
  constructor(message: string) {
    super(message, httpStatus.se);
  }
}

class AuthError extends RequestError {
  constructor(message: string) {
    super(message, httpStatus.na);
  }
}

export { RequestError, DBError, AuthError };
