import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import { tokenService } from '../service/token.service.js';

export const authenticate = async (req, res, next) => {
  const { refreshToken: cookieToken } = req.cookies;

  if (!cookieToken) {
    throw ApiError.unauthorized('You need to login');
  }

  const tokenRecord = await tokenService.getByToken(cookieToken);

  if (!tokenRecord.refreshToken) {
    throw ApiError.unauthorized('You need to login');
  }

  const user = await User.findByPk(tokenRecord.userId);

  if (!user) {
    throw ApiError.unauthorized('You need to login');
  }

  req.user = user;
  next();
};
