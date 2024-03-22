// eslint-disable-next-line no-shadow
import type { Request, Response, NextFunction } from 'express';
import type { Middleware } from '../Router/Router.types.js';
import ResponseError, { type ResponseErrorI } from './ResponseError.js';
import { ValidationError } from 'sequelize';

interface Details {
  cause?: Error;
  payload?: Record<string, unknown>;
  date?: Date;
}

export default class ApiError extends Error {
  public status: number;
  public details?: Details;

  constructor(status: number, message: string, details?: Details) {
    super(message);
    this.status = status;
    this.details = details;
  }

  private static log(error: ApiError) {
    // eslint-disable-next-line no-console
    console.log(error);
  }

  static BadRequest(message: string) {
    return new ApiError(400, message);
  }

  static Unauthorized(message?: string) {
    return new ApiError(401, message ?? 'User is not authorized');
  }

  static Forbidden(message: string) {
    return new ApiError(403, message);
  }

  static NotFound(message: string) {
    return new ApiError(404, message);
  }

  static Conflict(message: string) {
    return new ApiError(409, message);
  }

  static ServerError(message: string, details?: Details) {
    const date = new Date();

    return new ApiError(500, message, { ...details, date });
  }

  static catch(fn: Middleware): Middleware {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        fn(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  }

  static handleRouteNotFoundError(req: Request, res: Response, next: NextFunction) {
    next(ApiError.NotFound(`Route ${req.method} ${req.url} not found`));
  }

  static handle(error: ResponseErrorI, req: Request, res: Response, next: NextFunction) {
    if (error.status >= 400 && error.status < 500) {
      return res.status(error.status).send(new ResponseError(error.message, error.status));
    }

    if (error instanceof ValidationError) {
      return res.status(400).send(new ResponseError(error.message, 400));
    }

    if (error instanceof ApiError) {
      ApiError.log(error);

      return res
        .status(error.status)
        .send(new ResponseError('Internal server error', error.status));
    }

    ApiError.log(ApiError.ServerError('Some unhandled error !!!', { cause: error }));

    return res.status(500).send(new ResponseError('Unknown server error', 500));
  }
}
