import { User } from '../models/user.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../services/token.service.js';
import { randomUUID } from 'node:crypto';
import { emailService } from '../services/email.service.js';
import {
  normalizedEmail,
  validateEmail,
  validateName,
  validatePassword,
} from '../utils/validation.js';

const REFRESH_COOKIE = 'refreshToken';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.register(name, email, hashedPass);

  res.send({ message: 'OK' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({
    where: {
      activationToken,
    },
  });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired activation link');
  }

  user.activationToken = null;
  await user.save();

  await generateTokens(res, user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (typeof email !== 'string' || typeof password !== 'string') {
    throw ApiError.badRequest('Email and password are required');
  }

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Invalid email or password');
  }

  if (user.activationToken) {
    throw ApiError.badRequest('Please activate your email');
  }

  await generateTokens(res, user);
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  const emailError = validateEmail(email);

  if (emailError) {
    throw ApiError.badRequest(emailError);
  }

  const user = await userService.findByEmail(normalizedEmail(email));

  if (user && !user.activationToken) {
    const resetToken = randomUUID();

    user.passwordResetToken = resetToken;
    user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    await emailService.sendPasswordResetEmail(user.email, resetToken);
  }

  res.status(200).send({
    message:
      'If an eligible account exists, a password reset email has been sent',
  });
};

const resetPassword = async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  if (!token || typeof token !== 'string') {
    throw ApiError.badRequest('Reset token is required');
  }

  const passwordError = validatePassword(password);

  if (passwordError) {
    throw ApiError.badRequest(passwordError);
  }

  if (password !== confirmPassword) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const user = await User.findOne({
    where: {
      passwordResetToken: token,
    },
  });

  if (
    !user ||
    !user.passwordResetExpiresAt ||
    new Date(user.passwordResetExpiresAt).getTime() <= Date.now()
  ) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  user.password = await bcrypt.hash(password, 10);
  user.passwordResetToken = null;
  user.passwordResetExpiresAt = null;

  await user.save();

  res.status(200).send({
    message: 'Password has been reset successfully',
  });
};

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies ?? {};

  if (!refreshToken) {
    throw ApiError.unauthorized();
    return;
  }

  const userData = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
    return;
  }

  const user = await userService.findByPk(userData.id);

  if (!user || user.activationToken) {
    throw ApiError.unauthorized();
    return;
  }

  await generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = refreshToken ? jwtService.verifyRefresh(refreshToken) : null;

  if (userData) {
    await tokenService.remove(userData.id);
  }

  res.clearCookie(REFRESH_COOKIE, cookieOptions);
  res.sendStatus(204);
};

export const authController = {
  register,
  activate,
  login,
  requestPasswordReset,
  resetPassword,
  refresh,
  logout,
};
