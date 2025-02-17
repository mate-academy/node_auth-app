import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exceptions/api.error.js';
import { userService } from '../services/user.service.js';
import 'express-async-errors';

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const [, accessToken] = authHeader.split(' ');

  if (!accessToken) {
    throw ApiError.unauthorized();
  }

  const userData = jwtService.validateAccessToken(accessToken);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  const user = await userService.getById(userData.id);

  if (user.activationToken !== null) {
    throw ApiError.forbidden();
  }

  res.locals.user = { id: user.id, email: user.email };

  next();
}
