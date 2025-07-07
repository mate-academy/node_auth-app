import { User } from '../models/user.js';

import { userService } from '../services/user.service.js';

import { jwtService } from '../services/jwt.service.js';

import { ApiError } from '../exceptions/api.error.js';

import bcrypt from 'bcrypt';

import { tokenService } from '../services/token.service.js';

import { emailService } from '../services/email.service.js';

import { v4 as uuidv4 } from 'uuid';

const validateEmail = (value) => {
  const emailPattern = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }

  return undefined;
};

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
}

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    email: validateEmail(email),

    password: validatePassword(password),
  };

  if (errors.email || errors.password || !name) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.register(name, email, hashedPass);

  res.send({ message: 'ok' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.activationToken = null;

  await user.save();

  res.send(userService.normalize(user));
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  await generateToken(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await jwtService.verifyRefresh(refreshToken);

  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findById(userData.id);

  generateToken(res, user);
};

const generateToken = async (res, user) => {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);

  const refreshAccessToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshAccessToken);

  res.cookie('refreshToken', refreshAccessToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,

    httpOnly: true,
  });

  res.send({ user: normalizedUser, accessToken });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);

  res.sendStatus(204);
};

const passwordReset = async (req, res) => {
  const { email } = req.body;

  const passwordResetToken = uuidv4();

  const existUser = await userService.findByEmail(email);

  if (!existUser) {
    throw ApiError.badRequest('User not found', {
      email: 'User not found',
    });
  }

  existUser.passwordResetToken = passwordResetToken;

  await existUser.save();

  await emailService.sendResetPasswordEmail(email, passwordResetToken);

  res.send({ message: 'ok' });
};

const passwordResetConfirmation = async (req, res) => {
  const { passwordResetToken } = req.params;

  const { newPassword } = req.body;

  const user = await User.findOne({ where: { passwordResetToken } });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  const errors = {
    password: validatePassword(newPassword),
  };

  if (errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(newPassword, 10);

  user.password = hashedPass;

  user.passwordResetToken = null;

  await user.save();

  res.send(userService.normalize(user));
};

export const authController = {
  register,

  activate,

  login,

  refresh,

  logout,

  passwordReset,

  passwordResetConfirmation,

  generateToken,
};
