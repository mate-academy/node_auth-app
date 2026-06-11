import { NextFunction, Request, Response } from 'express';

export const catchError = (action: Function) => {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      await action(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
