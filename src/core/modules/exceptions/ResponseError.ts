import ApiError from './ApiError.js';

export interface ResponseErrorI extends Error {
  status: number;
}

export default class ResponseError {
  public error;

  constructor(error: ApiError);
  constructor(error: Error, status?: number);
  constructor(message: string, status?: number);

  constructor(param1: ApiError | Error | string, status?: number) {
    if (param1 instanceof ApiError) {
      this.error = { status: param1.status, message: param1.message };
    } else if (param1 instanceof Error) {
      this.error = { status, message: param1.message };
    } else {
      this.error = { status, message: param1 };
    }
  }
}
