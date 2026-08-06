import { User } from '../users/User.model.js';
import * as usersService from '../users/users.service.js';
import { jwtService } from '../../services/jwt.service.js';
import { ApiError } from '../../exceptions/api.error.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../../models/token/token.service.js';
import { emailService } from '../../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';

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

export const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = await jwtService.verifyRefresh(refreshToken);

  if (!user || !refreshToken) {
    throw ApiError.unauth();
  }

  await tokenService.remove(user.id);

  res.sendStatus(204);
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

export const resetPassword = async (req, res) => {
  const { email } = req.body;

  const emailError = validateEmail(email);

  if (emailError) {
    throw ApiError.badRequest('Bad Request', { email: emailError });
  }

  const user = await usersService.findByEmail(email);

  if (!user || user.activationToken) {
    throw ApiError.notFound('User not found', { email: 'No existing email' });
  }

  const resetToken = uuidv4();

  user.resetPasswordToken = resetToken;
  await user.save();

  await emailService.sendResetPasswordMail({
    email,
    resetToken,
  });

  res.send({ messege: 'OK' });
};

export const confirmResetPassword = async (req, res) => {
  const { password } = req.body;
  const { resetPasswordToken } = req.params;

  const isPasswordValid = validatePassword(password);

  if (isPasswordValid) {
    throw ApiError.badRequest('Bad Request', { password: isPasswordValid });
  }

  const user = await usersService.getByResetPasswordToken(resetPasswordToken);

  if (user.resetPasswordToken !== resetPasswordToken) {
    throw ApiError.badRequest('Link is not valid');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;
  user.resetPasswordToken = null;

  await user.save();

  res.send({ message: 'OK' });
};

const checkResetToken = async (req, res) => {
  const { resetPasswordToken } = req.params;

  const user = await usersService.getByResetPasswordToken(resetPasswordToken);

  if (!user || user.resetPasswordToken !== resetPasswordToken) {
    throw ApiError.notFound('Link is not valid');
  }

  res.send({ message: 'OK' });
};

export const authController = {
  register,
  login,
  activate,
  refresh,
  logout,
  resetPassword,
  confirmResetPassword,
  checkResetToken,
};
