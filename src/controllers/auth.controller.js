import { User } from '../models/user.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../services/token.service.js';
import { sendEmail } from '../utils/email.js';
// eslint-disable-next-line no-shadow
import crypto from 'crypto';

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return 'Email is required';
  }

  const trimmed = email.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return 'Invalid email format';
  }

  return null;
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return 'Password is required';
  }

  const trimmed = password.trim();

  if (trimmed.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  if (/\s/.test(trimmed)) {
    return 'Password must not contain spaces';
  }

  if (!/[A-Z]/.test(trimmed)) {
    return 'Password must contain at least one uppercase letter';
  }

  if (!/[a-z]/.test(trimmed)) {
    return 'Password must contain at least one lowercase letter';
  }

  if (!/[0-9]/.test(trimmed)) {
    return 'Password must contain at least one digit';
  }

  if (!/[!@#$%^&*(),.?":{}|<>_\-+=/[\]]/.test(trimmed)) {
    return 'Password must contain at least one special character';
  }

  const forbidden = ['password', 'qwerty', '12345678', '11111111', 'asdfghjk'];

  if (forbidden.some((f) => trimmed.toLowerCase().includes(f))) {
    return 'Password is too weak';
  }

  return null;
};

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password || !name) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.register(name, email, hashedPassword);
  res.status(201).json({ message: 'OK' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({
    where: { activationToken },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.activationToken = null;
  await user.save();

  return res.redirect(`${process.env.CLIENT_HOST}/profile`);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  const isActivated = user.activationToken === null;

  if (!isActivated) {
    throw ApiError.badRequest('User not activated');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  return generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = jwtService.verifyRefresh(refreshToken);

  const token = await tokenService.getByToken(refreshToken);

  if (!user || !token) {
    throw ApiError.unauthorized();
  }

  generateTokens(res, user);
};

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshAccessToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshAccessToken);

  res.cookie('refreshToken', refreshAccessToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
  });

  return res.status(200).json({
    user: normalizedUser,
    accessToken,
  });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const user = await jwtService.verifyRefresh(refreshToken);

  if (!user || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(user.id);

  res.clearCookie('refreshToken');

  return res.sendStatus(204);
};

const requestResetPassword = async (req, res) => {
  const { email } = req.body;
  const user = await userService.findByEmail(email);

  if (!user) {
    return res.status(200).json({ message: 'Email sent' });
  }

  user.resetToken = crypto.randomBytes(32).toString('hex');
  user.resetTokenExpire = Date.now() + 3600_000; // 1h
  await user.save();

  await sendEmail(
    email,
    'Reset password',
    `${process.env.CLIENT_HOST}/reset/${user.resetToken}`,
  );
  res.json({ message: 'Email sent' });
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirm } = req.body;

  if (password !== confirm) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const user = await User.findOne({ where: { resetToken: token } });

  if (!user || Date.now() > user.resetTokenExpire) {
    throw ApiError.badRequest('Invalid or expired token');
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = null;
  user.resetTokenExpire = null;
  await user.save();

  res.json({ message: 'Password updated' });
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  requestResetPassword,
  resetPassword,
};
