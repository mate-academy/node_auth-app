import bcrypt from 'bcrypt';
import { RequestHandler, Response as ExpressResponse } from 'express';
import { usersRepository } from '../entity/users.repository.js';
import { mailer } from '../utils/mailer.js';
import { NormalizedUser, userService } from '../services/user.service.js';
import { jwt } from '../utils/jwt.js';
import { User } from '@prisma/client';
import { tokensRepository } from '../entity/tokens.repository.js';

const register: RequestHandler = async (req, res) => {
  const { email, password, name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const errors = {
    email: userService.validateEmail(email),
    password: userService.validatePassword(password),
  };

  if (Object.values(errors).some((error) => error)) {
    return res.status(400).json({
      errors,
      message: 'Validation error',
    });
  }

  const existingUser = await usersRepository.getByEmail(email);

  if (existingUser) {
    return res.status(400).json({
      errors: { email: 'Email is already taken' },
      message: 'Validation error',
    });
  }

  const activationToken = globalThis.crypto.randomUUID();
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await usersRepository.create(
    email,
    hashedPassword,
    name,
    activationToken,
  );

  await mailer.sendActivationLink(email, activationToken);

  res.json({
    user: userService.normalize(user),
  });
};

async function sendAuthentication(res: ExpressResponse, user: User) {
  const userData = userService.normalize(user);
  const accessToken = jwt.generateAccessToken(userData);
  const refreshToken = jwt.generateRefreshToken(userData);

  await tokensRepository.deleteByUserId(user.id);
  await tokensRepository.create(user.id, refreshToken);

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

const activate: RequestHandler = async (req, res) => {
  const { email, token } = req.params;

  if (typeof email !== 'string' || typeof token !== 'string') {
    return res.status(400).json({ message: 'Invalid activation parameters' });
  }

  const user = await usersRepository.getByEmail(email);

  if (!user || user.activationToken !== token) {
    return res
      .status(404)
      .json({ message: 'Activation link is invalid or expired' });
  }

  await usersRepository.activate(email);

  user.activationToken = null;

  await sendAuthentication(res, user);
};

const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  const user = await usersRepository.getByEmail(email);
  const isPasswordValid = await bcrypt.compare(password, user?.password || '');

  if (!user || !isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (user.activationToken) {
    return res
      .status(403)
      .json({ message: 'Account is not activated. Please check your email.' });
  }

  await sendAuthentication(res, user);
};

const refresh: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = jwt.validateRefreshToken(refreshToken) as NormalizedUser;
  const user = await usersRepository.getByEmail(userData?.email || '');
  const token = await tokensRepository.getByToken(refreshToken);

  if (!user || !userData || !token || token.userId !== user.id) {
    res.clearCookie('refreshToken');

    return res.status(401).json({ message: 'Invalid token' });
  }

  await sendAuthentication(res, user);
};

const logout: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = jwt.validateRefreshToken(refreshToken) as NormalizedUser;

  if (userData) {
    await tokensRepository.deleteByUserId(userData.id);
  }

  res.clearCookie('refreshToken', {
    sameSite: 'none',
    secure: true,
  });
  res.sendStatus(204);
};

const forgotPassword: RequestHandler = async (req, res) => {
  const { email } = req.body;
  const user = await usersRepository.getByEmail(email);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const resetToken = globalThis.crypto.randomUUID();
  await usersRepository.updateResetToken(email, resetToken);
  await mailer.sendResetLink(email, resetToken);

  res.json({ message: 'Reset link has been sent to your email' });
};

const resetPassword: RequestHandler = async (req, res) => {
  const { token, password, confirmation } = req.body;

  if (password !== confirmation) {
    return res.status(400).json({ errors: { confirmation: 'Passwords do not match' }, message: 'Validation error' });
  }

  const error = userService.validatePassword(password);
  if (error) {
    return res.status(400).json({ errors: { password: error }, message: 'Validation error' });
  }

  const user = await usersRepository.getByResetToken(token);
  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired reset token' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await usersRepository.updatePassword(user.email, hashedPassword);
  await usersRepository.updateResetToken(user.email, null);

  res.json({ message: 'Password has been successfully reset' });
};

const updateProfile: RequestHandler = async (req, res) => {
  const { name, email, confirmation, password } = req.body;
  const currentUser = (req as any).user;

  if (!currentUser) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const dbUser = await usersRepository.getByEmail(currentUser.email);
  if (!dbUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  const updateData: { name?: string; email?: string } = {};

  if (name) {
    updateData.name = name;
  }

  if (email && email !== currentUser.email) {
    if (!password) {
      return res.status(400).json({ errors: { password: 'Password is required to change email' }, message: 'Validation error' });
    }
    const isPasswordValid = await bcrypt.compare(password, dbUser.password);
    if (!isPasswordValid) {
      return res.status(400).json({ errors: { password: 'Wrong password' }, message: 'Validation error' });
    }

    if (email !== confirmation) {
      return res.status(400).json({ errors: { confirmation: 'Emails do not match' }, message: 'Validation error' });
    }

    const emailError = userService.validateEmail(email);
    if (emailError) {
      return res.status(400).json({ errors: { email: emailError }, message: 'Validation error' });
    }

    const existingUser = await usersRepository.getByEmail(email);
    if (existingUser) {
      return res.status(400).json({ errors: { email: 'Email is already taken' }, message: 'Validation error' });
    }

    updateData.email = email;
    await mailer.sendEmailChangeNotification(currentUser.email);
  }

  const updatedUser = await usersRepository.updateProfile(currentUser.id, updateData);

  res.json({
    user: userService.normalize(updatedUser),
  });
};

const updatePasswordProfile: RequestHandler = async (req, res) => {
  const { oldPassword, password } = req.body;
  const currentUser = (req as any).user;

  if (!currentUser) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const dbUser = await usersRepository.getByEmail(currentUser.email);
  if (!dbUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (!oldPassword) {
    return res.status(400).json({ errors: { oldPassword: 'Old password is required' }, message: 'Validation error' });
  }
  const isOldPasswordValid = await bcrypt.compare(oldPassword, dbUser.password);
  if (!isOldPasswordValid) {
    return res.status(400).json({ errors: { oldPassword: 'Wrong old password' }, message: 'Validation error' });
  }

  const error = userService.validatePassword(password);
  if (error) {
    return res.status(400).json({ errors: { password: error }, message: 'Validation error' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await usersRepository.updatePassword(currentUser.email, hashedPassword);

  res.json({ message: 'Password updated successfully' });
};

export const authController = {
  logout,
  refresh,
  login,
  register,
  activate,
  forgotPassword,
  resetPassword,
  updateProfile,
  updatePassword: updatePasswordProfile,
};
