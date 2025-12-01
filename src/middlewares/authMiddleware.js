import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';

export const authMiddleware = async (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    throw ApiError.unauthorized();
  }

  const userToken = jwtService.verify(token);

  if (!userToken) {
    throw ApiError.notFound();
  }

  next();
};

export const guestMiddleware = async (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    return next();
  }

  const accessToken = jwtService.verify(token);

  if (accessToken) {
    return res.redirect('/profile');
  }

  next();
};
