import { userService } from '../services/user.service.js';
import bcrypt from 'bcrypt';

import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exceptions/api.error.js';
import { tokenService } from '../services/token.service.js';

const register = async (req, res) => {
  const { email, password } = req.body;

  const errors = {
    email: userService.validateEmail(email),
    password: userService.validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }
  await userService.create({ email, password });

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

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
};
