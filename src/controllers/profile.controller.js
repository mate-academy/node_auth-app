import { ApiError } from '../exeptions/apiError.js';
import userService from '../services/user.service.js';
import {
  validateName,
  validatePassword,
  validateConfirmPassword,
} from '../utils/validation.js';
import bcrypt from 'bcrypt';

const get = async (req, res) => {
  const user = await userService.getById(req.userId);

  if (!user) {
    throw ApiError.NotFound();
  }

  res.send(userService.normalize(user));
};

const updateName = async (req, res) => {
  const { name } = req.body;

  const errors = {
    name: validateName(name),
  };

  if (errors.name) {
    throw ApiError.BadRequest('validation error', errors);
  }

  const user = await userService.updateName(req.userId, name);

  res.status(200).send(userService.normalize(user));
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  const errors = {
    oldPassword: validatePassword(oldPassword),
    newPassword: validatePassword(newPassword),
    confirmPassword: validateConfirmPassword(newPassword, confirmPassword),
  };

  if (errors.oldPassword || errors.newPassword || errors.confirmPassword) {
    throw ApiError.BadRequest('validation error', errors);
  }

  const user = await userService.getById(req.userId);
  const isValidOldPassword = await bcrypt.compare(oldPassword, user.password);

  if (!isValidOldPassword) {
    throw ApiError.BadRequest('Validation error', {
      oldPassword: 'Password is wrong',
    });
  }

  await userService.updatePassword(req.userId, newPassword);
  res.status(200).send('Password changed successfully');
};

export default {
  get,
  updateName,
  updatePassword,
};
