import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { jwtService } from './jwt.service.js';
import { userService } from './user.service.js';
import { emailService } from './email.service.js';
import { tokenService } from './token.service.js';
import { authValidation } from '../validations/auth.validation.js';
import { ApiError } from '../utils/api.error.js';
import { logger } from '../utils/logger.js';

const register = async (name, email, password) => {
  const errors = {
    name: authValidation.validateName(name),
    email: authValidation.validateEmail(email),
    password: authValidation.validatePassword(password),
  };

  if (Object.values(errors).some((error) => error)) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const existingUser = await userService.getByEmail(email);

  if (existingUser) {
    throw ApiError.badRequest('User with this email already exists', {
      email: 'User with this email already exists',
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const activationToken = uuidv4();

  await userService.register(name, email, hashedPassword, activationToken);
  await emailService.sendActivationEmail(name, email, activationToken);
};

const authenticate = async (user) => {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.create(normalizedUser.id, refreshToken);

  return {
    user: normalizedUser,
    accessToken,
    refreshToken,
  };
};

const activate = async (activationToken) => {
  const user = await userService.getByActivationToken(activationToken);

  if (!user || user.activationToken !== activationToken) {
    logger.warn('Invalid activation token attempt');
    throw ApiError.badRequest();
  }

  return await userService.activate(activationToken);
};

const login = async (email, password) => {
  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Incorrect password');
  }

  if (user.activationToken) {
    throw ApiError.forbidden('Account is not activated', {
      activation: 'Account is not activated',
    });
  }

  return user;
};

const logout = async (refreshToken) => {
  if (!refreshToken) {
    logger.warn('Logout attempt without refresh token');
    throw ApiError.unauthorized();
  }

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  await tokenService.removeByToken(refreshToken);
};

const refresh = async (refreshToken) => {
  if (!refreshToken) {
    logger.warn('Refresh attempt without refresh token');
    throw ApiError.unauthorized();
  }

  const userData = jwtService.verifyRefresh(refreshToken);
  const user = await userService.getByEmail(userData?.email ?? '');
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !user || !token || token.userId !== user.id) {
    logger.warn('Invalid refresh token attempt');
    throw ApiError.unauthorized();
  }

  return user;
};

const resetPasswordNotification = async (email) => {
  const user = await userService.getByEmail(email);

  if (!user) {
    logger.warn('Password reset email attempt for non-existent user', {
      email,
    });
    throw ApiError.badRequest();
  }

  if (user.passwordResetToken) {
    logger.warn(
      'Password reset email attempt when there is already a pending reset',
      {
        email,
      },
    );
    throw ApiError.badRequest(
      'There is already a pending password reset for this email',
    );
  }

  const passwordResetToken = uuidv4();

  await userService.setPasswordResetToken(user.id, passwordResetToken);

  await emailService.sendResetPasswordEmail(
    user.name,
    email,
    passwordResetToken,
  );
};

const confirmPasswordReset = async (
  passwordResetToken,
  password,
  confirmation,
) => {
  const user = await userService.getByPasswordResetToken(passwordResetToken);

  if (!user || user.passwordResetToken !== passwordResetToken) {
    logger.warn('Invalid password reset token attempt');
    throw ApiError.badRequest();
  }

  if (!password || !confirmation) {
    throw ApiError.badRequest('Password and confirmation fields are required');
  }

  if (password !== confirmation) {
    throw ApiError.badRequest('Confirmation and password do not match');
  }

  const isNewEqualsOld = await bcrypt.compare(password, user.password);

  if (isNewEqualsOld) {
    throw ApiError.badRequest('New password is the same as the old password');
  }

  const validationError = authValidation.validatePassword(password);

  if (validationError) {
    throw ApiError.badRequest('Validation error', {
      password: validationError,
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.updatePassword(user.id, hashedPassword);
  await userService.clearPasswordResetToken(user.id);
  await tokenService.invalidateSessions(user.id);
};

const updateName = async (id, name, refreshToken) => {
  if (!refreshToken) {
    logger.warn('Update name attempt without refresh token', { userId: id });
    throw ApiError.unauthorized();
  }

  const user = await userService.getById(id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const validationError = authValidation.validateName(name);

  if (validationError) {
    throw ApiError.badRequest('Validation error', {
      name: validationError,
    });
  }

  if (user.name === name) {
    throw ApiError.badRequest(
      'New name must be different from the current name',
    );
  }

  await userService.updateName(id, name);
};

const updateEmailNotification = async (
  refreshToken,
  userId,
  newEmail,
  password,
) => {
  if (!refreshToken) {
    logger.warn('Update email attempt without refresh token', { userId });
    throw ApiError.unauthorized();
  }

  const validationError = authValidation.validateEmail(newEmail);

  if (validationError) {
    throw ApiError.badRequest('Validation error', {
      newEmail: validationError,
    });
  }

  const existingUser = await userService.getByEmail(newEmail);

  if (existingUser) {
    throw ApiError.badRequest('Email already in use');
  }

  const user = await userService.getById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Incorrect password');
  }

  if (user.pendingEmail) {
    throw ApiError.badRequest('There is already a pending email change');
  }

  const hasPendingEmail = await userService.getByPendingEmail(newEmail);

  if (hasPendingEmail) {
    throw ApiError.badRequest('This email is already pending for another user');
  }

  const pendingEmailToken = uuidv4();

  await userService.setPendingEmail(userId, newEmail, pendingEmailToken);

  await emailService.sendActivationNewEmail(
    user.name,
    newEmail,
    pendingEmailToken,
  );
};

const confirmEmailChange = async (pendingEmailToken) => {
  const user = await userService.getByPendingEmailToken(pendingEmailToken);

  if (!user || user.pendingEmailToken !== pendingEmailToken) {
    logger.warn('Invalid email change activation attempt');
    throw ApiError.badRequest();
  }

  await userService.updateEmail(user.id, user.pendingEmail);
  await emailService.sendChangeEmailNotification(user.name, user.email);
  await tokenService.invalidateSessions(user.id);
};

const updatePassword = async (
  refreshToken,
  userId,
  password,
  newPassword,
  confirmation,
) => {
  if (!refreshToken) {
    logger.warn('Update password attempt without refresh token', { userId });
    throw ApiError.unauthorized();
  }

  const user = await userService.getById(userId);

  if (!password || !newPassword || !confirmation) {
    throw ApiError.badRequest(
      'Old password, new password, and confirmation fields are required',
    );
  }

  const isOldPasswordValid = await bcrypt.compare(password, user.password);

  if (!isOldPasswordValid) {
    throw ApiError.badRequest('Incorrect old password');
  }

  const validationError = authValidation.validatePassword(newPassword);

  if (validationError) {
    throw ApiError.badRequest('Validation error', {
      newPassword: validationError,
    });
  }

  if (password === newPassword) {
    throw ApiError.badRequest(
      'New password must be different from the old password',
    );
  }

  if (newPassword !== confirmation) {
    throw ApiError.badRequest('Confirmation and password do not match');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await userService.updatePassword(userId, hashedPassword);
  await tokenService.invalidateSessions(userId);
};

export const authService = {
  register,
  authenticate,
  activate,
  login,
  logout,
  refresh,
  resetPasswordNotification,
  confirmPasswordReset,
  updateName,
  updateEmailNotification,
  confirmEmailChange,
  updatePassword,
};
