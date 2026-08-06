import { User } from '../users/User.model.js';
import * as usersService from '../users/users.service.js';
import { jwtService } from '../../services/jwt.service.js';
import { ApiError } from '../../exceptions/api.error.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../../models/token/token.service.js';

const nameValidation = (name) => {
  if (!name) {
    return 'Name is required';
  }

  if (name.length < 1) {
    return 'At least 1 characters';
  }
};

const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return 'Invalid email';
  }
};

const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'At least 6 characters';
  }
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: nameValidation(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (Object.values(errors).some(Boolean)) {
    throw ApiError.badRequest('Bad Request', errors);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await usersService.register({ name, email, password: hashedPassword });

  res.send({ messege: 'OK' });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await usersService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  if (user.activationToken) {
    throw ApiError.badRequest('Account is not activated');
  }

  generateTokens(res, user);
};

export const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.activationToken = null;

  await user.save();

  res.send(user);
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ApiError.unauth();
  }

  const user = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!user || !token) {
    throw ApiError.unauth();
  }

  generateTokens(res, user);
};

const generateTokens = async (res, user) => {
  const normalizedUser = usersService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser);

  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day in ms
    secure: process.env.APP_ENV !== 'development',
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

export const authController = {
  register,
  login,
  activate,
  refresh,
};
