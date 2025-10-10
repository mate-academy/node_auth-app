import { ApiError } from '../../exeptions/api.error.js';
import { userService } from '../../services/user.service.js';
import {
  validateEmail,
  validatePassword,
} from '../../services/userValidation.service.js';

export const updateName = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw ApiError.badRequest('Name is required');
  }

  const userId = req.user.id;

  const user = await userService.updateName(name, userId);

  res.json({
    message: 'Name updated successfully',
    user: { id: user.id, name: user.name },
  });
};

export const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmation } = req.body;
  const userId = req.user.id;

  if (!oldPassword || !newPassword || !confirmation) {
    throw ApiError.badRequest('All fields are required');
  }

  if (newPassword !== confirmation) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const passwordError = validatePassword(newPassword);

  if (passwordError) {
    throw ApiError.badRequest(passwordError);
  }

  const user = await userService.updatePassword(
    oldPassword,
    newPassword,
    userId,
  );

  res.json({
    message: 'Password changed successfully',
    user: { id: user.id, name: user.name },
  });
};

export const requestEmailChange = async (req, res) => {
  const { password, newEmail } = req.body;
  const userId = req.user.id;

  const errors = {
    email: validateEmail(newEmail),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  await userService.updateEmailRequest(password, userId, newEmail);

  res.json({
    message: 'Message was sent to your current email',
  });
};

export const confirmEmailChange = async (req, res) => {
  const { token } = req.params;

  await userService.updateEmailConfirmation(token);

  res.json({
    message: 'Email changed successfully',
  });
};
