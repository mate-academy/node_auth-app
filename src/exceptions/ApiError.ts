'use strict';

import { Error } from 'sequelize';

interface Errors {
  [key: string]: string
}

export class ApiError extends Error {
  constructor(
    private _status: number,
    private _message: string,
    private _errors: Error
  ) {
    super(_message);
  }

  static;
}

// class ApiError extends Error {
//   constructor(status: number, message: string, errors: Errors = {}) {
//     super(message);
//
//     this.status = status;
//     this.errors = errors;
//   }
//
//   static BadRequest(message, errors) {
//     return new ApiError(400, message, errors);
//   }
//
//   static Unauthorized() {
//     return new ApiError(401, 'User is not authorized');
//   }
//
//   static NotFound() {
//     return new ApiError(404, 'Not Found');
//   }
// }
