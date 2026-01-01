import { ApiError } from '../exceptions/api.error.js';
import { User } from '../models/user.js';

export const activatedMiddleware = async (req, res, next) => {
  const { id } = req.user;
  const user = await User.findByPk(id, { attributes: ['activationToken'] });

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  if (user.activationToken !== 'activated') {
    throw ApiError.notActivated();
  }

  next();
};
