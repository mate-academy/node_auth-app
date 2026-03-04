import { Request, RequestHandler, Response } from 'express';
import * as usersRepository from '../entities/users.repository.js';
import bcrypt from 'bcrypt';
import * as userService from '../services/user.service.js';
import * as mailer from '../utils/mailer.js';
import { User } from '@prisma/client';
import * as jwt from '../utils/jwt.js';
import * as tokensRepository from '../entities/tokens.repository.js';

export const sendAuthentication = async (res: Response, user: User) => {
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
};

export const register: RequestHandler = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

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
      message: 'User already exists',
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const activationToken = crypto.randomUUID();

  const user = await usersRepository.create(
    email,
    hashedPassword,
    activationToken,
    name,
  );

  await mailer.sendActivationLink(email, activationToken);

  res.json({ user: userService.normalize(user) });
};

export const activate: RequestHandler = async (req: Request, res: Response) => {
  const email = req.params.email as string;
  const token = req.params.token as string;
  const user = await usersRepository.getByEmail(email);

  if (!user || user.activationToken !== token) {
    return res.status(400).json({
      message: 'Invalid activation link',
    });
  }

  const activatedUser = await usersRepository.activate(email);

  await sendAuthentication(res, activatedUser);
};

export const login: RequestHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await usersRepository.getByEmail(email);
  const isPasswordOkay = await bcrypt.compare(password, user?.password || '');

  if (!user || !isPasswordOkay) {
    return res.status(401).json({
      message: 'Invalid credentials',
    });
  }

  if (user.activationToken) {
    return res.status(403).json({
      message: 'Please activate your account first. Check your email',
    });
  }

  await sendAuthentication(res, user);
};

export const refresh: RequestHandler = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = jwt.validateRefreshToken(refreshToken);
  const user = await usersRepository.getByEmail(userData?.email || '');
  const token = await tokensRepository.getByToken(refreshToken);

  if (!user || !userData || !token || token.userId !== user.id) {
    res.clearCookie('refreshToken');

    res.status(401).json({
      message: 'Invalid token',
    });

    return;
  }

  await sendAuthentication(res, user);
};

export const logout: RequestHandler = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = jwt.validateRefreshToken(refreshToken);

  if (userData) {
    await tokensRepository.deleteByUserId(userData.id);
  }

  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

export const requestPasswordReset: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { email } = req.body;
  const user = await usersRepository.getByEmail(email);

  if (user) {
    const resetToken = crypto.randomUUID();

    await usersRepository.setResetToken(email, resetToken);
    await mailer.sendResetLink(email, resetToken);
  }

  res.json({
    message: 'If the email exists, a reset link has been sent.',
  });
};

export const resetPassword: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const email = req.params.email as string;
  const token = req.params.token as string;
  const { password, confirmation } = req.body;

  const passwordError = userService.validatePassword(password);

  if (passwordError) {
    return res.status(400).json({
      errors: { password: passwordError },
      message: 'Validation error',
    });
  }

  if (password !== confirmation) {
    return res.status(400).json({
      errors: { confirmation: 'Passwords do not match' },
      message: 'Validation error',
    });
  }

  const user = await usersRepository.getByEmail(email);

  if (!user || !user.resetToken || user.resetToken !== token) {
    return res.status(404).json({
      message: 'Invalid reset link',
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await usersRepository.updatePassword(user.id, hashedPassword);
  await usersRepository.setResetToken(email, null);

  res.json({
    message: 'Password has been updated successfully',
  });
};

export const getAll: RequestHandler = async (req: Request, res: Response) => {
  const users = await usersRepository.getAllActive();

  res.json(users.map(userService.normalize));
};
