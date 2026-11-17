import type { RequestHandler } from 'express';

export const catchError = (action: RequestHandler): RequestHandler => {
  return async (req, res, next) => {
    try {
      await action(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
