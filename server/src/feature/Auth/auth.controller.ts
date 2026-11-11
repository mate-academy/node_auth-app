import type { RequestHandler, Response } from 'express';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import {
  normalizeAuth,
  validateEmail,
  validatePassword,
  type NormalizedAuthUser,
} from '../User/utils.js';
import { userRepository } from '../User/user.repository.js';
import { mailer } from '../../config/mailer.js';
import type { User } from '../../models/User.model.js';
import { jwt } from '../../config/jwt.js';
import { refreshTokenRepository } from '../Token/refreshToken.repository.js';
import { resetPasswordTokenRepository } from '../Token/resetPasswordToken.repository.js';

const register: RequestHandler = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (Object.values(errors).some((error) => error)) {
    return res.status(400).json({
      errors,
      message: 'Validation error',
    });
  }

  const existingUser = await userRepository.getByEmail(email);

  if (existingUser) {
    return res.status(400).json({
      errors: { email: 'Email is already taken' },
      message: 'Validation error',
    });
  }

  const activationToken = randomBytes(32).toString('hex');

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userRepository.create({
    name,
    email,
    password: hashedPassword,
    activationToken,
  });

  await mailer.sendActivationLink(email, activationToken);

  res.json({
    user: normalizeAuth(user),
  });
};

const activate: RequestHandler = async (req, res) => {
  const { email, token } = req.params;
  const user = await userRepository.getByEmail(email);

  if (!user || user.activationToken !== token) {
    return res.status(404).json({
      message: 'Invalid activation link',
    });
  }

  await userRepository.activate(email);

  sendAuthentication(res, user);
};

const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  const user = await userRepository.getByEmail(email);
  const isPasswordValid = await bcrypt.compare(password, user?.password || '');

  if (!user || !isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  sendAuthentication(res, user);
};

const logout: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = jwt.validateRefreshToken(refreshToken) as NormalizedAuthUser;

  if (userData) {
    await refreshTokenRepository.deleteByUserId(userData.id);
  }

  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

const refresh: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = jwt.validateRefreshToken(refreshToken) as NormalizedAuthUser;
  const user = await userRepository.getByEmail(userData?.email || '');
  const token = await refreshTokenRepository.getByToken(refreshToken);

  if (!user || !userData || !token || token.userId !== user.id) {
    res.clearCookie('refreshToken');
    res.status(401).json({ message: 'Invalid token' });
    return;
  }

  await sendAuthentication(res, user);
};

const sendAuthentication = async (res: Response, user: User) => {
  const userData = normalizeAuth(user);
  const accessToken = jwt.generateAccessToken(userData);
  const refreshToken = jwt.generateRefreshToken(userData);

  await refreshTokenRepository.deleteByUserId(user.id);
  await refreshTokenRepository.create(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  return res.send({
    user: userData,
    accessToken,
  });
};

const checkActivaton: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = jwt.validateRefreshToken(refreshToken) as NormalizedAuthUser;

  if (userData) {
    const user = await userRepository.getByEmail(userData.email);

    return res.send({ isActivated: !user.activationToken });
  }

  return res.send({ isActivated: false });
};

const forgotPassword: RequestHandler = async (req, res) => {
  const { email } = req.body;

  const errors = {
    email: validateEmail(email),
  };

  if (Object.values(errors).some((error) => error)) {
    return res.status(400).json({
      errors,
      message: 'Validation error',
    });
  }

  const existingUser = await userRepository.getByEmail(email) as User | null;

  if (existingUser) {
    const resetToken = jwt.generateResetPasswordToken(normalizeAuth(existingUser));
    const hashedResetToken = await bcrypt.hash(resetToken, 10);

    const token = await resetPasswordTokenRepository
      .create(existingUser.id, hashedResetToken);

     await mailer.sendResetPasswordLink(email, resetToken);
  }

  return res.status(201).json({
    message: 'If this email exists, we sent a reset link.',
  });
};

const resetPassword: RequestHandler = async (req, res) => {
  const { token } = req.params;

  if (typeof token !== 'string') {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }

  const userData = jwt.validateResetPasswordToken(token) as NormalizedAuthUser | null;
  const user = await userRepository.getByEmail(userData?.email || '');

  if (!user || !userData) {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }

  const tokenFromDB = await resetPasswordTokenRepository.getUnusedByUserId(user.id);
  const isTokenExist = await bcrypt.compare(token, tokenFromDB?.token || '');

  if (!tokenFromDB || !isTokenExist) {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }

  await resetPasswordTokenRepository.useToken(tokenFromDB.token);

  const { password, confirmation } = req.body;
  console.log("Used token " + JSON.stringify({ password, confirmation }) + "\nStart update "+ Date.now());

  if (password !== confirmation) {
    res.status(401).json({ message: 'Password not confirmed' });
  }

  const newPassword = await bcrypt.hash(password, 10);
  await userRepository.update(user.id, {password: newPassword});

  await resetPasswordTokenRepository.deleteByUserId(user.id);

  return res.status(201).json({
    message: 'Your password has been changed successfully.',
  })
};

export const authController = {
  register,
  activate,
  login,
  logout,
  refresh,
  checkActivaton,
  forgotPassword,
  resetPassword,
};
