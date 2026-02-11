import { jwtService } from '../services/jwt.service.js';
import { userService } from '../services/user.service.js';
import { ApiError } from '../utils/api.error.js';
import { logger } from '../utils/logger.js';

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization ?? '';

  if (!authHeader.startsWith('Bearer ')) {
    logger.error('Authorization header missing or malformed');
    throw ApiError.unauthorized();
  }

  const token = authHeader.split(' ')[1];
  const userData = jwtService.verify(token);

  if (!userData) {
    logger.error('Invalid or expired token');
    throw ApiError.unauthorized();
  }

  const user = await userService.getById(userData.id);

  if (!user) {
    logger.error('User not found for token', { userId: userData.id });
    throw ApiError.notFound();
  }

  req.userId = user.id;
  next();
};
