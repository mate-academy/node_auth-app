import { randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import { userRepository } from '../User/user.repository.js';
import { validateEmail, validatePassword, normalizeAuth, type NormalizedAuthUser } from '../User/utils.js';
import { mailer } from '../../config/mailer.js';
import { ApiError } from '../../exceptions/api.error.js';
import { jwt } from '../../config/jwt.js';
import type { User } from '../../models/User.model.js';
import { refreshTokenRepository } from '../Token/refreshToken.repository.js';
import { resetPasswordTokenRepository } from '../Token/resetPasswordToken.repository.js';

const register = async (name: string, email: string, password: string) => {

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (Object.values(errors).some(Boolean)) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  const existingUser = await userRepository.getByEmail(email);

  if (existingUser) {
    throw ApiError.BadRequest('Email is already taken', { email: 'Email is already taken' });
  }

  const activationToken = randomBytes(32).toString('hex');
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userRepository.create({
    name,
    email,
    password: hashedPassword,
    activationToken,
  });

  await mailer.sendActivationLink(email, activationToken);

  return normalizeAuth(user);
};

const refresh = async (refreshToken: string) => {
  const userData = jwt.validateRefreshToken(refreshToken);

  if (!userData) {
    throw ApiError.Unauthorized('Invalid token');
  }

  const user = await userRepository.getByEmail(userData.email);
  const token = await refreshTokenRepository.getByToken(refreshToken);

  if (!user || !token || token.userId !== user.id) {
    throw ApiError.Unauthorized('Invalid token');
  }

  return createAuthentication(user);
};

const login = async (email: string, password: string) => {
  const user = await userRepository.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('Invalid credentials');
  }

  const isActivated = user.activationToken === null;

  if (!isActivated) {
    throw ApiError.Forbidden('Check your email for activation account');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Invalid credentials');
  }

  return createAuthentication(user);
};

const activate = async (email: string, activationToken: string) => {
  const user = await userRepository.getByEmail(email);

  if (!user || user.activationToken !== activationToken) {
    throw ApiError.NotFound('Invalid activation link');
  }

  await userRepository.activate(email);

  return createAuthentication(user);
};

const logout = async (refreshToken: string) => {
  // const userData = jwt.validateRefreshToken(refreshToken) as NormalizedAuthUser;

  // if (userData) {
  //   await refreshTokenRepository.deleteByUserId(userData.id);
  // }
  await refreshTokenRepository.deleteToken(refreshToken);
};

const forgotPassword = async (email: string) => {
  const emailError = validateEmail(email);

  if (emailError) {
    throw ApiError.BadRequest('Validation error', {
      email: emailError,
    });
  }

  const existingUser = await userRepository.getByEmail(email) as User | null;

  if (existingUser) {
    const resetToken = jwt.generateResetPasswordToken(
      normalizeAuth(existingUser),
    );

    const hashedResetToken = await bcrypt.hash(resetToken, 10);

    await resetPasswordTokenRepository.create(
      existingUser.id,
      hashedResetToken,
    );

    await mailer.sendResetPasswordLink(email, resetToken);
  }

  return {
    message: 'If this email exists, we sent a reset link.',
  };
};

const resetPassword = async (
  token: string,
  password: string,
  confirmation: string,
) => {
  const userData = jwt.validateResetPasswordToken(token) as NormalizedAuthUser | null;

  if (!userData) {
    throw ApiError.BadRequest('Invalid token');
  }

  const user = await userRepository.getByEmail(userData.email);

  if (!user) {
    throw ApiError.BadRequest('Invalid token');
  }

  const tokenFromDB = await resetPasswordTokenRepository.getUnusedByUserId(user.id);
  const isTokenExist = await bcrypt.compare(token, tokenFromDB?.token || '');


  if (!tokenFromDB || !isTokenExist) {
    throw ApiError.BadRequest('Invalid token');
  }

  const validationError = validatePassword(password);

  if (validationError) {
    throw ApiError.BadRequest(validationError);
  }

  if (password !== confirmation) {
    throw ApiError.BadRequest('Password not confirmed');
  }

  const newPassword = await bcrypt.hash(password, 10);

  await userRepository.update(user.id, { password: newPassword });

  // after that we'll delete this token
  //await resetPasswordTokenRepository.useToken(tokenFromDB.token);
  await resetPasswordTokenRepository.deleteByUserId(user.id);

  return {
    message: 'Your password has been changed successfully.',
  };
};

const createAuthentication = async (user: User) => {
  const userData = normalizeAuth(user);

  const accessToken = jwt.generateAccessToken(userData);
  const refreshToken = jwt.generateRefreshToken(userData);

  await refreshTokenRepository.deleteByUserId(user.id);
  await refreshTokenRepository.create(user.id, refreshToken);

  return {
    user: userData,
    accessToken,
    refreshToken,
  };
};

export const authService = {
  register,
  refresh,
  login,
  activate,
  logout,
  forgotPassword,
  resetPassword,
}
