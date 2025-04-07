import bcrypt from 'bcrypt';
import { User } from '../models/user.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exceptions/api.error.js';
import { tokenService } from '../services/token.service.js';
import { emailService } from '../services/email.service.js';
import {
  validateEmail,
  validateName,
  validatePassword,
} from '../utils/vlidation.js';

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  const user = await userService.register({ name, email, password });

  res.send(user);
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({
    where: { activationToken },
  });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.activationToken = null;
  await user.save();

  await sendAuthentication(res, user);
  res.redirect('/user/profile');
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User with this email does not exist');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Password is wrong');
  }

  await sendAuthentication(res, user);
  res.redirect('/user/profile');
};

const refresh = async (req, res, next) => {
  const user = req.user;

  if (!user) {
    throw ApiError.Unauthorized();
  }

  const token = await tokenService.getByToken(
    req.cookies.refreshToken,
    'refreshToken',
  );

  if (!token) {
    throw ApiError.Unauthorized();
  }

  await sendAuthentication(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  res.clearCookie('refreshToken');

  if (userData) {
    await tokenService.remove(userData.id);
  }

  res.redirect('/login');
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw ApiError.BadRequest('Email is required');
  }

  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.NotFound();
  }

  const userData = userService.normalize(user);
  const resetPasswordToken = jwtService.generateResetPasswordToken(userData);

  await tokenService.save(user.id, resetPasswordToken, 'resetPasswordToken');

  emailService.sendResetPasswordEmail(email, resetPasswordToken);

  res.json({ message: 'Password reset email sent' });
};

const resetPassword = async (req, res) => {
  const { password, confirmation } = req.body;
  const { resetPasswordToken } = req.params;

  if (!password || !confirmation) {
    throw ApiError.BadRequest('All fields are required');
  }

  if (password !== confirmation) {
    throw ApiError.BadRequest('Password and confirmation do not match');
  }

  const tokenData = await tokenService.getByToken(
    resetPasswordToken,
    'resetPasswordToken',
  );

  if (!tokenData) {
    throw ApiError.BadRequest('Invalid or expired reset token');
  }

  const user = await userService.getById(tokenData.userId);

  if (!user) {
    throw ApiError.NotFound('User not found');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userData = userService.normalize(user);

  await userService.changePassword(userData.id, hashedPassword);

  await tokenService.remove(user.id, 'resetPasswordToken');

  res.redirect('/login');
};

async function sendAuthentication(res, user) {
  const userData = userService.normalize(user);
  const accessToken = jwtService.generateAccessToken(userData);
  const refreshToken = jwtService.generateRefreshToken(userData);

  tokenService.save(user.id, refreshToken, 'refreshToken');

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.cookie('accessToken', accessToken, {
    maxAge: 15 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });
}

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  requestPasswordReset,
  resetPassword,
};
