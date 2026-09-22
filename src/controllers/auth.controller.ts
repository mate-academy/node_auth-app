import bcrypt from 'bcrypt';
import cryptoModules from 'crypto';
import { RequestHandler, Response as ExpressResponse } from 'express';
import { NormalizedUser, userService } from '../services/user.service';
import {
  validateEmail,
  validateName,
  validatePassword,
} from '../utils/validators';
import { mailer } from '../utils/mailer';
import { jwt } from '../utils/jwt';
import { User } from '../models/User';
import { tokensService } from '../services/token.service';

const sendAuthentication = async (res: ExpressResponse, user: User) => {
  const userData = userService.normalize(user);
  const accessToken = jwt.generateAccessToken(userData);
  const refreshToken = jwt.generateRefreshToken(userData);

  await tokensService.deleteByUserId(user.id);
  await tokensService.create(user.id, refreshToken);

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

const register: RequestHandler = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (Object.values(errors).some((error) => error)) {
    return res.status(400).json({
      errors,
      message: 'Validation error',
    });
  }

  const activationToken = cryptoModules.randomBytes(32).toString('hex');
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userService.create(
    name,
    email,
    hashedPassword,
    activationToken,
  );

  await mailer.sendActivationLink(email, activationToken);

  res.json({ user: userService.normalize(user) });
};

const activate: RequestHandler = async (req, res) => {
  const email = req.params.email as string;
  const token = req.params.token as string;
  const user = await userService.getByEmail(email);

  if (!user || user.activationToken !== token) {
    return res.sendStatus(404);
  }

  await userService.activate(email);

  await sendAuthentication(res, user);
};

const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.getByEmail(email);
  const isPasswordValid = await bcrypt.compare(password, user?.password || '');

  if (!user || !isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (!user.isActive) {
    return res.status(403).json({
      message: 'Please activate your email before logging in.',
    });
  }

  await sendAuthentication(res, user);
};

const refresh: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = jwt.validateRefreshToken(refreshToken) as NormalizedUser;
  const user = await userService.getByEmail(userData?.email || '');
  const token = await tokensService.getByToken(refreshToken);

  if (!user || !userData || !token || token.userId !== user.id) {
    res.clearCookie('refreshToken');
    res.status(401).json({ message: 'Invalid token' });

    return;
  }

  await sendAuthentication(res, user);
};

const logout: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = jwt.validateRefreshToken(refreshToken) as NormalizedUser;

  if (userData) {
    await tokensService.deleteByUserId(userData.id);
  }

  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

const forgotPassword: RequestHandler = async (req, res) => {
  const email = req.body.email as string;

  const user = await userService.getByEmail(email);

  if (!user) {
    return res.json({ message: 'If this email exists, we sent a reset link.' });
  }

  const resetToken = cryptoModules.randomBytes(32).toString('hex');

  await mailer.sendResetPasswordLink(email, resetToken);
  await userService.updateResetToken(email, resetToken);

  res.json({ message: 'If this email exists, we sent a reset link.' });
};

const resetPassword: RequestHandler = async (req, res) => {
  const token = req.params.token as string;
  const password = req.body.password as string;

  const user = await userService.getByResetToken(token);

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired reset token.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.createNewPassword(user.email, hashedPassword);

  res.json({ message: 'Password has been successfully reset.' });
};

const confirmEmailChange: RequestHandler = async (req, res) => {
  const token = req.params.token as string;

  const user = await userService.getByEmailChangeToken(token);

  if (!user) {
    return res.status(400).json({
      message: 'Invalid or expired email change token',
    });
  }

  if (
    !user.emailChangeTokenExpires ||
    user.emailChangeTokenExpires.getTime() < Date.now()
  ) {
    return res.status(400).json({
      message: 'Invalid or expired email change token',
    });
  }

  const { oldEmail, newEmail } = await userService.confirmEmailChange(user);

  await mailer.notifyEmailChanged(oldEmail, newEmail);

  res.redirect(`${process.env.CLIENT_URL}/email-confirmed`);
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  confirmEmailChange,
};
