import { normalizeUser } from '../dto/user.dto.js';
import { ApiError } from '../exeptions/api.error.js';
import { userService } from '../services/user.service.js';
import { passwordUtils } from '../utils/password.util.js';

const getAllActiveUsers = async (req, res) => {
  const activeUsers = await userService.getActiveUsers();

  res.status(200).send(activeUsers.map(normalizeUser));
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name } = req?.body || {};

  const errors = {
    name: userService.validateUserName(name),
  };

  const isErrorExists = Object.values(errors).some(Boolean);

  if (isErrorExists) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const user = await userService.getUserById(id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const updatedUser = await userService.updateUser(user.id, { name });

  res.send(normalizeUser(updatedUser));
};

export const changePassword = async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword, confirmPassword } = req?.body || {};

  const errors = {
    newPassword: userService.validatePassword(newPassword),
  };

  const isErrorExists = Object.values(errors).some(Boolean);

  if (isErrorExists) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const user = await userService.getUserById(id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isPasswordValid = await passwordUtils.comparePassword({
    hashedPassword: user.password,
    password: oldPassword,
  });

  if (!isPasswordValid) {
    throw ApiError.badRequest('Validation error', {
      oldPassword: 'The password is wrong',
    });
  }

  if (newPassword !== confirmPassword) {
    throw ApiError.badRequest('Validation error', {
      passwords: 'Passwords do not match',
    });
  }

  const hashedPassword = await passwordUtils.getHashedPassword(newPassword);
  await userService.updateUser(user.id, { password: hashedPassword });

  res.sendStatus(204);
};

export const userController = {
  getAllActiveUsers,
  updateUser,
  changePassword,
};
