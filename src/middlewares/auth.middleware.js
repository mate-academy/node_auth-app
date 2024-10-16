import { usersService } from '../services/users.service.js';
import { authService } from '../services/auth.service.js';
import { ApiError } from '../exceptions/api.error.js';

export const authMiddleware = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    throw ApiError.Unauthorized();
  }

  const [, token] = authorization.split(' ');

  if (!token) {
    throw ApiError.Unauthorized();
  }

  const tokenData = authService.verifyAccessToken(token);

  if (!tokenData) {
    throw ApiError.Unauthorized();
  }

  const user = usersService.getByEmail(tokenData.email);

  if (!user) {
    throw ApiError.Unauthorized();
  }

  next();
};
