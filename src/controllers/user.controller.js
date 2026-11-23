import { User } from '../models/user.js';
import { userService } from '../services/user.service.js';
import { ApiError } from '../exceptions/api.error.js';

const updateName = async (req, res) => {
  const { name } = req.body;

  if (typeof name !== 'string' || !name.trim()) {
    throw ApiError.badRequest('Name is required');
  }

  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw ApiError.unathorized();
  }

  user.name = name.trim();
  await user.save();

  res.send(userService.normalize(user));
};

export const userController = { updateName };
