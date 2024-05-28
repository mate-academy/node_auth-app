import { ApiError } from '../exeptions/apiError.js';
import { User } from '../models/User.js';
import userService from '../services/user.service.js';
import {
  validateName,
  validatePassword,
  validateConfirmPassword,
  validateEmail,
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

const updateEmail = async (req, res) => {
  const { password, newEmail } = req.body;

  const errors = {
    password: validatePassword(password),
    newEmail: validateEmail(newEmail),
  };

  if (errors.password || errors.newEmail) {
    throw ApiError.BadRequest('validation errors', errors);
  }

  await userService.updateEmail({ id: req.userId, password, newEmail });
  res.send({ message: 'OK' });
};

const confirmEmail = async (req, res) => {
  const { token: activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    throw ApiError.NotFound();
  }

  user.activationToken = null;
  await user.save();

  res.send({ message: 'OK' });
};

export default {
  get,
  updateName,
  updatePassword,
  updateEmail,
  confirmEmail,
};
