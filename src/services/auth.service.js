import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { jwtService } from './jwt.service.js';
import { userService } from './user.service.js';
import { emailService } from './email.service.js';
import { tokenService } from './token.service.js';
import { socialAccountService } from './social-account.service.js';
import { ApiError } from '../utils/api.error.js';
import { logger } from '../utils/logger.js';

const SUPPORTED_PROVIDERS = ['google', 'facebook', 'github'];

const TOKEN_TTL = {
  activation: 24 * 60 * 60 * 1000,
  passwordReset: 60 * 60 * 1000,
  pendingEmail: 24 * 60 * 60 * 1000,
};

const expiresIn = (ttlMs) => new Date(Date.now() + ttlMs);

const register = async (name, email, password) => {
  const existingUser = await userService.getByEmail(email);

  if (existingUser) {
    throw ApiError.badRequest('User with this email already exists', {
      email: 'User with this email already exists',
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const activationToken = uuidv4();
  const activationExpiresAt = expiresIn(TOKEN_TTL.activation);

  await userService.register(
    name,
    email,
    hashedPassword,
    activationToken,
    activationExpiresAt,
  );
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

  if (!user) {
    logger.warn('Invalid activation token attempt');
    throw ApiError.badRequest();
  }

  if (user.activationExpiresAt && user.activationExpiresAt < new Date()) {
    logger.warn('Expired activation token attempt');
    throw ApiError.badRequest('Activation link has expired');
  }

  return userService.activate(activationToken);
};

const login = async (email, password) => {
  const user = await userService.getByEmail(email);

  if (!user || !user.password) {
    logger.warn('Login attempt for non-existent or social-only user', {
      email,
    });
    throw ApiError.badRequest('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    logger.warn('Login attempt with incorrect password', {
      email,
    });
    throw ApiError.badRequest('Invalid email or password');
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

  if (!userData) {
    logger.warn('Invalid refresh token attempt');
    throw ApiError.unauthorized();
  }

  const user = await userService.getByEmail(userData.email);
  const token = await tokenService.getByToken(refreshToken);

  if (!user || !token || token.userId !== user.id) {
    logger.warn('Invalid refresh token attempt');
    throw ApiError.unauthorized();
  }

  return user;
};

const requestPasswordReset = async (email) => {
  const user = await userService.getByEmail(email);

  if (!user) {
    logger.warn('Password reset email attempt for non-existent user', {
      email,
    });
    throw ApiError.badRequest();
  }

  if (user.activationToken) {
    throw ApiError.badRequest('Account is not activated');
  }

  if (!user.password) {
    throw ApiError.badRequest('This account uses social login');
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
  const passwordResetExpiresAt = expiresIn(TOKEN_TTL.passwordReset);

  await userService.setPasswordResetToken(
    user.id,
    passwordResetToken,
    passwordResetExpiresAt,
  );

  await emailService.sendResetPasswordEmail(
    user.name,
    email,
    passwordResetToken,
  );
};

const confirmPasswordReset = async (passwordResetToken, password) => {
  if (!passwordResetToken) {
    logger.warn('Password reset attempt without token');
    throw ApiError.badRequest();
  }

  const user = await userService.getByPasswordResetToken(passwordResetToken);

  if (!user) {
    logger.warn('Invalid password reset token attempt');
    throw ApiError.badRequest();
  }

  if (user.passwordResetExpiresAt && user.passwordResetExpiresAt < new Date()) {
    await userService.clearPasswordResetToken(user.id);
    throw ApiError.badRequest('Password reset link has expired');
  }

  if (!user.password) {
    throw ApiError.badRequest('Set a password first to reset your password');
  }

  const isNewEqualsOld = await bcrypt.compare(password, user.password);

  if (isNewEqualsOld) {
    throw ApiError.badRequest('New password is the same as the old password');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.updatePassword(user.id, hashedPassword);
  await userService.clearPasswordResetToken(user.id);
  await tokenService.invalidateSessions(user.id);
};

const updateName = async (id, name) => {
  const user = await userService.getById(id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.name === name) {
    throw ApiError.badRequest(
      'New name must be different from the current name',
    );
  }

  await userService.updateName(id, name);
};

const requestEmailChange = async (userId, newEmail, password) => {
  const existingUser = await userService.getByEmail(newEmail);

  if (existingUser) {
    throw ApiError.badRequest('Email already in use');
  }

  const user = await userService.getById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (!user.password) {
    throw ApiError.badRequest('Set a password first to change your email');
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
  const pendingEmailExpiresAt = expiresIn(TOKEN_TTL.pendingEmail);

  await userService.setPendingEmail(
    userId,
    newEmail,
    pendingEmailToken,
    pendingEmailExpiresAt,
  );

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

  if (user.pendingEmailExpiresAt && user.pendingEmailExpiresAt < new Date()) {
    await userService.clearPendingEmail(user.id);
    throw ApiError.badRequest('Email change link has expired');
  }

  await userService.updateEmail(user.id, user.pendingEmail);
  await emailService.sendChangeEmailNotification(user.name, user.email);
  await tokenService.invalidateSessions(user.id);
};

const updatePassword = async (userId, password, newPassword) => {
  const user = await userService.getById(userId);

  if (user.password) {
    const isOldPasswordValid = await bcrypt.compare(password, user.password);

    if (!isOldPasswordValid) {
      throw ApiError.badRequest('Incorrect old password');
    }

    if (password === newPassword) {
      throw ApiError.badRequest(
        'New password must be different from the old password',
      );
    }
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await userService.updatePassword(userId, hashedPassword);
  await tokenService.invalidateSessions(userId);
};

const unlinkSocialAccount = async (userId, provider) => {
  if (!SUPPORTED_PROVIDERS.includes(provider)) {
    throw ApiError.badRequest('Unsupported provider');
  }

  const user = await userService.getById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const socialAccounts = await socialAccountService.getByUserId(userId);
  const accountToRemove = socialAccounts.find((a) => a.provider === provider);

  if (!accountToRemove) {
    throw ApiError.notFound('Social account not found');
  }

  const hasPassword = !!user.password;
  const remainingSocials = socialAccounts.length - 1;

  if (!hasPassword && remainingSocials === 0) {
    throw ApiError.badRequest(
      'Cannot remove last authentication method. Set a password first.',
    );
  }

  await socialAccountService.remove(accountToRemove.id);
};

export const authService = {
  register,
  authenticate,
  activate,
  login,
  logout,
  refresh,
  requestPasswordReset,
  confirmPasswordReset,
  updateName,
  requestEmailChange,
  confirmEmailChange,
  updatePassword,
  unlinkSocialAccount,
};
