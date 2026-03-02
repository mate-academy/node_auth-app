import type { NextFunction, Request, Response } from 'express';
// import { ApiError } from '../types/index.js';
import * as jws from '../service/jws.service.ts';
import { ApiError } from '../types/index.ts';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authorization = req.headers['authorization'] || '';
  const [, accessToken] = authorization?.split(' ');

  if (!authorization || !accessToken) {
    throw ApiError.authError([
      {
        message: 'Access denied',
      },
    ]);
  }

  const normalizedUser = jws.validateAccessToken(accessToken);

  if (!normalizedUser) {
    throw ApiError.badRequest([
      {
        message: 'Bad access token',
      },
    ]);
  }

  req.normalizedUser = normalizedUser;

  next();
};
