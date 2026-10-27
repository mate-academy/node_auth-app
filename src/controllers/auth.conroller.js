import { User } from '../models/user.js';

import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import { tokenService } from '../services/token.service.js';

const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

function validateEmail(value) {
  if (!value) return 'Email is required';
  if (!EMAIL_PATTERN.test(value)) return 'Email is not valid';
}

function validatePassword(value) {
  if (!value) return 'Password is required';
  if (value.length < 6) return 'At least 6 characters';
}

function validateName(value) {
  if (!value) return 'Name is required';
  if (value.length < 2) return 'At least 2 characters';
}

const register = async (req, res) => {
  const { email, password, name } = req.body;
  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };
  if (errors.email || errors.password || errors.name) {
    throw ApiError.badRequest('bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);
  await userService.register(email, hashedPass, name);

  res.send({ message: 'OK' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);

    return;
  }
  user.activationToken = null;
  user.save();

  res.send(user);
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

  if (user.activationToken) {
    throw ApiError.badRequest('Please activate your email');
  }

  await generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;
  // console.log('req.cookies', req.cookies);
  // console.log('userData', userData);

  const userData = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
    return;
  }
  const user = await userService.findByEmail(userData.email);
  await generateTokens(res, user);
};

const generateTokens = async (res, user) => {
  const normalizeUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizeUser);
  const refreshToken = jwtService.signRefresh(normalizeUser);

  await tokenService.save(normalizeUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
  });
  res.send({
    user: normalizeUser,
    accessToken,
  });
};

const logout = async (req, res) => {
  console.log('req.cookies', req.cookies);

  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);
  // console.log('refreshToken', refreshToken);
  // console.log('userData', userData);
  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
    return;
  }

  await tokenService.remove(userData.id);
  res.sendStatus(204);
};

const resetPassword = async (req, res) => {
  const { email, password, newEmail } = req.body;

  const user = await userService.findByEmail(email); // знайти користувача в базі дани

  const isPasswordValid = await bcrypt.compare(password, user.password); //porinyannya password bcrypt.compare
  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }
  const existingUser = await userService.findByEmail(newEmail); //чи новий email вже існує в базі
  if (existingUser) {
    throw ApiError.badRequest('Email already in use');
  }
  res.sendStatus(204);
};

const sendResetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmation } = req.body;

  const user = await userService.getByResetToken(token); // знайти за токеном
  if (!user) {
    throw ApiError.badRequest('Wrong reset link');
  }

  if (password !== confirmation) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const hashedPassword = await bcrypt.hash(password, 10); // захешувати пароль
  user.password = hashedPassword;
  user.resetPasswordToken = null; // очистити токен
  await user.save();
  res.json({ message: 'Password reset successfully' });
};

const resetPasswordToken = async (req, res) => {
  const { email } = req.body;

  const user = await findByEmail(email);
  if (!user) {
    res.sendStatus(204);
    return;
  }

  const resetToken = uuid();

  user.resetPasswordToken = resetToken;
  await user.save();

  await emailService.sendPostResetPassword(email, resetToken);

  res.sendStatus(204);
};

export const authContoller = {
  register,
  activate,
  login,
  refresh,
  logout,
  sendResetPassword,
  resetPassword,
  resetPasswordToken,
};
