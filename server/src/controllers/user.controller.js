import { ApiError } from '../exceptions/api.error.js';
import { meService } from '../services/me.service.js';
import { tokenService } from '../services/token.service.js';
import { userService } from '../services/user.service.js';

function validateName(value) {
  if (!value) {
    return 'Name is required';
  }

  if (value.trim().length < 3) {
    return 'At least 3 characters';
  }
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
}

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();

  res.send(users.map(userService.normalize));
};

const updateName = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  const errors = {
    name: validateName(name),
  };

  if (!name || errors.name) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const updatedUser = await meService.updateName(userId, name.trim());

  res.send(userService.normalize(updatedUser));
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user?.id;

  const errors = {
    oldPassword: !oldPassword ? 'Old password is required' : null,
    newPassword: validatePassword(newPassword),
  };

  if (errors.oldPassword || errors.newPassword) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const user = await meService.changePassword(userId, oldPassword, newPassword);

  const normalizedUser = userService.normalize(user);

  res.send({
    message: 'Password successfully changed.',
    user: normalizedUser,
  });
};

const requestEmailChange = async (req, res) => {
  const userId = req.user.id;
  const { newEmail, password } = req.body;

  await meService.requestEmailChange(userId, newEmail, password);

  res.send({
    message: 'A confirmation email has been sent to the new email address.',
  });
};

const confirmEmailChange = async (req, res) => {
  const { token } = req.body;

  const updatedUser = await meService.confirmEmailChange(token);

  const { accessToken, refreshToken, user } =
    await tokenService.generateAndSaveTokens(updatedUser);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({
    user,
    accessToken,
  });
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw ApiError.badRequest('Email is required');
  }

  await meService.requestPasswordReset(email);

  res.send({
    message:
      'If an account with that email exists, we sent a password reset link.',
  });
};

const confirmPasswordReset = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw ApiError.badRequest('The token and the new password are required.');
  }

  await meService.resetPassword(token, password);

  res.send({
    message: 'Password successfully changed.',
  });
};

export const userController = {
  getAllActivated,
  updateName,
  changePassword,
  requestEmailChange,
  confirmEmailChange,
  requestPasswordReset,
  confirmPasswordReset,
};
