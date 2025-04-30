import { NextFunction, Request, Response } from 'express';

import { jwt } from '../utils/jwt.js';
import { ApiError } from '../exceptions/api.error.js';
import { NormalizedUser } from '../types/NormalizedUser.js';
import { userRepository } from '../entity/user.repository.js';

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers['authorization'] || '';
  const [, accessToken] = authHeader.split(' ');

  if (!authHeader || !accessToken) {
    throw ApiError.unauthorized('Token is required');
  }

  const normalizedUser = jwt.validateAccessToken(accessToken) as
    | NormalizedUser
    | undefined;

  if (!normalizedUser) {
    throw ApiError.unauthorized('Invalid token');
  }

  const user = await userRepository.getByEmail(normalizedUser.email);

  if (!user) {
    throw ApiError.unauthorized('Invalid token');
  }

  req.user = user;

  next();
}
