import { User } from '../models/index.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';
import { tokenService } from '../services/token.service.js';
import bcrypt from 'bcrypt';
import {
  validateEmail,
  validateName,
  validatePassword,
} from '../utils/validation.js';

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

  res.send({
    message:
      // eslint-disable-next-line max-len
      'Registration successful. Please check your email to activate your account.',
  });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    return res.sendStatus(404);
  }

  user.activationToken = null;
  await user.save();

  const {
    user: normalizedUser,
    accessToken,
    refreshToken,
  } = await generateTokens(user);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.send({
    user: normalizedUser,
    accessToken,
    redirectUrl: `${process.env.CLIENT_HOST}/profile`,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('User with this email does not exist');
  }

  if (user.activationToken) {
    throw ApiError.badRequest('Please activate your account before logging in');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Incorrect password');
  }

  const {
    user: normalizedUser,
    accessToken,
    refreshToken,
  } = await generateTokens(user);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.send({ user: normalizedUser, accessToken });
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw ApiError.badRequest('Email is required');
  }

  await userService.passwordReset(email);
  res.send({ message: 'Password reset link sent to email (if user exists)' });
};

const passwordReset = async (req, res) => {
  const { token } = req.params;
  const { password, confirmation } = req.body;

  if (!password || !confirmation) {
    throw ApiError.badRequest('Password and confirmation are required');
  }

  if (password !== confirmation) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const passwordError = validatePassword(password);

  if (passwordError) {
    throw ApiError.badRequest(passwordError);
  }

  const user = await User.findOne({
    where: {
      resetToken: token,
      resetTokenExpires: { $gt: new Date() },
    },
  });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = null;
  user.resetTokenExpires = null;
  await user.save();

  res.send({ message: 'Password has been reset successfully' });
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ApiError.unauthorized();
  }

  const userData = jwtService.verifyRefresh(refreshToken);
  const tokenRecord = await tokenService.getByToken(refreshToken);

  if (!userData || !tokenRecord) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  if (!user) {
    throw ApiError.unauthorized();
  }

  const {
    accessToken,
    refreshToken: newRefreshToken,
    user: normalizedUser,
  } = await generateTokens(user);

  res.cookie('refreshToken', newRefreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  res.send({ user: normalizedUser, accessToken });
};

const generateTokens = async (user) => {
  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  return { user: normalizedUser, accessToken, refreshToken };
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ApiError.unauthorized();
  }

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.sendStatus(204);
};

export const authController = {
  register,
  activate,
  login,
  requestPasswordReset,
  passwordReset,
  refresh,
  logout,
};
