import type { RequestHandler, Response as ExResponse } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { usersRepository } from '../entity/users.repository.js';
import { tokensRepository } from '../entity/tokens.repository.js';
import { userService } from '../services/user.service.js';
import { jwt } from '../utils/jwt.js';
import { mailer } from '../utils/mailer.js';

async function sendAuthentication(res: ExResponse, user: any) {
  const userData = userService.normalize(user);
  const accessToken = jwt.generateAccessToken(userData);
  const refreshToken = jwt.generateRefreshToken(userData);

  await tokensRepository.deleteByUserId(user.id);
  await tokensRepository.create(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.json({
    user: userData,
    accessToken,
  });
}

const register: RequestHandler = async (req, res) => {
  const { email, password, name } = req.body;

  const errors = {
    email: userService.validateEmail(email),
    password: userService.validatePassword(password),
    name: name ? userService.validateName(name) : null,
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

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const activationToken = uuidv4();

  const user = await usersRepository.create(
    email,
    hashedPassword,
    activationToken,
    name,
  );

  await mailer.sendActivationLink(email, activationToken);

  res.status(201).json({
    message:
      'Registration successful. Please check your email to activate your account.',
    user: userService.normalize(user),
  });
};

const activate: RequestHandler = async (req, res) => {
  const { email, token } = req.params;
  const user = await usersRepository.getByEmail(email);

  if (!user || user.activationToken !== token) {
    return res.status(404).json({ message: 'Invalid activation link' });
  }

  if (user.isActive) {
    return res.status(400).json({ message: 'Account is already activated' });
  }

  await usersRepository.activate(email);

  const updatedUser = await usersRepository.getByEmail(email);

  if (updatedUser) {
    await sendAuthentication(res, updatedUser);
  }
};

const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

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

  const user = await usersRepository.getByEmail(email);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (!user.isActive) {
    return res.status(401).json({
      message:
        'Account not activated. Please check your email for activation link.',
    });
  }

  await sendAuthentication(res, user);
};

const refresh: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = jwt.validateRefreshToken(refreshToken) as any;
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
  const userData = jwt.validateRefreshToken(refreshToken) as any;

  if (userData) {
    await tokensRepository.deleteByUserId(userData.id);
  }

  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

const requestPasswordReset: RequestHandler = async (req, res) => {
  const { email } = req.body;

  const emailError = userService.validateEmail(email);

  if (emailError) {
    return res.status(400).json({
      errors: { email: emailError },
      message: 'Validation error',
    });
  }

  const user = await usersRepository.getByEmail(email);

  if (!user) {
    // Don't reveal if email exists or not
    return res.json({
      message: 'If the email exists, a password reset link has been sent.',
    });
  }

  const resetToken = uuidv4();
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await usersRepository.setResetToken(email, resetToken, expiry);
  await mailer.sendPasswordReset(email, resetToken);

  res.json({
    message: 'If the email exists, a password reset link has been sent.',
  });
};

const resetPassword: RequestHandler = async (req, res) => {
  const { email, token } = req.params;
  const { password, confirmation } = req.body;

  const errors = {
    password: userService.validatePassword(password),
  };

  if (password !== confirmation) {
    errors.password = 'Passwords do not match';
  }

  if (Object.values(errors).some((error) => error)) {
    return res.status(400).json({
      errors,
      message: 'Validation error',
    });
  }

  const user = await usersRepository.getByEmail(email);

  if (!user || user.resetToken !== token) {
    return res.status(404).json({ message: 'Invalid reset link' });
  }

  if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    return res.status(400).json({ message: 'Reset link has expired' });
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  await usersRepository.resetPassword(email, hashedPassword);

  res.json({ message: 'Password has been reset successfully' });
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  requestPasswordReset,
  resetPassword,
};
