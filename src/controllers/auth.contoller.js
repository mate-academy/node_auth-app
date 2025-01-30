import { userService } from '../services/user.service.js';
import bcrypt from 'bcrypt';

import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exceptions/api.error.js';

const register = async (req, res) => {
  const { email, password } = req.body;

  const errors = {
    email: userService.validateEmail(email),
    password: userService.validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  await userService.create(email, password);

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

  const isValidPassword = bcrypt.compare(password, user?.password || '');

  if (!user || !isValidPassword) {
    res.status(401).json({ message: 'Invalid credentials' });
  }
  generateTokens(res, user);
};

const refresh = (req, res) => {
  const { refreshToken } = req.cookies;

  const user = jwtService.validateRefreshToken(refreshToken);

  if (!user) {
    throw ApiError.unauthorized();
  }

  generateTokens(res, user);
};

const generateTokens = (res, user) => {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.generateAccessToken(normalizedUser);
  const refreshToken = jwtService.generateRefreshToken(normalizedUser);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });
  res.send({ user: normalizedUser, accessToken });
};

export const authController = {
  register,
  activate,
  login,
  refresh
};
