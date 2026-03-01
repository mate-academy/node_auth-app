import { ApiError } from '../exeptions/api.error.js';
import { userService } from '../services/user.service.js';
import { jwt } from '../utils/jwt.util.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized();
    }

    const accessToken = authHeader.split(' ')[1];
    const userData = jwt.validateAccessToken(accessToken);
    const user = await userService.getUserById(userData?.id);

    if (!user) {
      throw ApiError.unauthorized('Invalid token');
    }

    if (user.passwordChangedAt) {
      const now = Date.now();
      const passwordChangedTime = new Date(user.passwordChangedAt).getTime();

      if (passwordChangedTime > now) {
        throw ApiError.unauthorized('Token invalid. Password was changed');
      }
    }

    req.user = userData;
    next();
  } catch (error) {
    throw ApiError.unauthorized('Invalid or expired token');
  }
};
