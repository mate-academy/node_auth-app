import { AppError } from '../core/AppError.js';

export const extractBearerToken = (authorizationHeader) => {
  if (!authorizationHeader) {
    throw new AppError('Error authentication, empty token', 401);
  }

  const [scheme, token] = authorizationHeader.trim().split(' ');

  if (!scheme || !token || scheme !== 'Bearer') {
    throw new AppError(
      'Error authentication, token must be in format: Bearer <token>',
      401,
    );
  }

  return token;
};
