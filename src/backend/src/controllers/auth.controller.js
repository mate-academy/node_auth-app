import { User } from '../models/user.js';
import 'dotenv/config';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../services/token.service.js';
import { emailService } from '../services/email.service.js';
import { validateValues } from '../utils/validateValues.js';

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: validateValues.name(name),
    email: validateValues.email(email),
    password: validateValues.password(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.register(name, email, hashedPassword);

  res.send({ message: 'OK' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    throw ApiError.notFound('Not found');

    return;
  }
  user.activationToken = null;
  await user.save();

  await tokenService.generateTokens(res, user);
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

  if (user.activationToken !== null) {
    throw ApiError.unauthorized('Account is not activated. Check your email!');
  }

  await tokenService.generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ApiError.unauthorized();
  }

  const userData = jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  // if (!userData || !token) {
  //   throw ApiError.unauthorized();

  //   return;
  // }

  const user = await userService.findById(userData.id);

  if (!user) {
    throw ApiError.unauthorized();
  }

  await tokenService.generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized();

    return;
  }

  await tokenService.remove(userData.id);

  res.clearCookie('refreshToken');

  res.sendStatus(204);
};

const sendPasswordResetLink = async (req, res) => {
  const { email } = req.body;

  await userService.sendPasswordResetLink(email);

  res.send({ message: 'OK' });
};

const confirmNewPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  const user = await User.findOne({ where: { resetToken } });

  if (!user) {
    throw ApiError.unauthorized();

    return;
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedNewPassword;
  user.resetToken = null;

  await user.save();

  res.sendStatus(204);
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  sendPasswordResetLink,
  confirmNewPassword,
};
