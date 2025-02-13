import { userService } from '../services/user.service.js';
import bcrypt from 'bcrypt';

import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exceptions/api.error.js';
import { tokenService } from '../services/token.service.js';
import { emailService } from '../services/email.service.js';

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: userService.validateName(name),
    email: userService.validateEmail(email),
    password: userService.validatePassword(password),
  };

  if (errors.email || errors.password || errors.name) {
    throw ApiError.badRequest('Bad request', errors);
  }
  await userService.create({ name, email, password });

  res.send({ message: 'User was created' });
};

const activate = async (req, res) => {
  const { email, token } = req.params;

  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  if (user.activationToken !== token) {
    throw ApiError.badRequest('ActivationToken is wrong');
  }

  user.activationToken = null;
  await user.save();

  const normalizedUser = userService.normalize(user);

  res.json({
    user: normalizedUser,
    accessToken: jwtService.generateAccessToken(normalizedUser),
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isValidPassword = await bcrypt.compare(password, user?.password || '');

  if (!isValidPassword) {
    throw ApiError.badRequest('Wrong password');
  }
  await sendAuthentication(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = jwtService.validateRefreshToken(refreshToken);

  if (!user) {
    throw ApiError.unauthorized();
  }

  await sendAuthentication(res, user);
};

async function sendAuthentication(res, user) {
  const userData = userService.normalize(user);
  const accessToken = jwtService.generateAccessToken(userData);
  const refreshToken = jwtService.generateRefreshToken(userData);

  await tokenService.save(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.send({
    user: userData,
    accessToken,
  });
}

const logout = async (req, res) => {
  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.badRequest('User with this email does not exist');
  }

  const normalizedUser = userService.normalize(user);

  const resetToken = jwtService.generateResetToken(normalizedUser);

  await emailService.sendResetLink(email, resetToken);

  res.json({ message: 'Reset link sent' });
};

const resetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const isValidPassword = userService.validatePassword(newPassword);

  if (isValidPassword) {
    throw ApiError.badRequest('Wrong password', { isValidPassword });
  }

  const resetToken = jwtService.validateResetToken(token);

  if (!resetToken) {
    throw ApiError.badRequest('Invalid or expired token');
  }

  const user = await userService.getById(resetToken.id);

  if (!user) {
    throw ApiError.notFound('No such User');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: 'Password successfully reset' });
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};
