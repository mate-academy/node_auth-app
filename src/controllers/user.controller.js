import { normalizeUser } from '../dto/user.dto.js';
import { ApiError } from '../exeptions/api.error.js';
import { authService } from '../services/auth.service.js';
import { tokenService } from '../services/token.service.js';
import { userService } from '../services/user.service.js';
import { mailer } from '../utils/mailer.js';
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
  await userService.updateUser(user.id, {
    password: hashedPassword,
    passwordChangedAt: new Date(),
  });
  await tokenService.deleteByToken(user.id);

  res.sendStatus(204);
};

export const changeEmail = async (req, res) => {
  const { id } = req.params;
  const { password, newEmail } = req?.body || {};

  const errors = {
    password: userService.validatePassword(password),
    newEmail: userService.validateEmail(newEmail),
  };

  const isErrorExists = Object.values(errors).some(Boolean);

  if (isErrorExists) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const existingUser = await userService.getUserByEmail(newEmail);

  if (existingUser) {
    throw ApiError.badRequest('This email is already taken');
  }

  const user = await userService.getUserById(id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isPasswordValid = await passwordUtils.comparePassword({
    hashedPassword: user.password,
    password,
  });

  if (!isPasswordValid) {
    throw ApiError.badRequest('Validation error', {
      password: 'The password is wrong',
    });
  }

  const activationToken = await authService.generateActivationToken();
  await userService.updateUser(user.id, {
    activationToken,
    email: newEmail,
  });
  await tokenService.deleteByUserId(user.id);
  await mailer.sendActivationLink(newEmail, activationToken);
  await mailer.confirmationOfEmailChange(user.email, newEmail);

  res.status(200).send({
    message:
      'Email has been changed. Activate new email. The letter has been sent to the new email.',
  });
};

export const userController = {
  getAllActiveUsers,
  updateUser,
  changePassword,
  changeEmail,
};
