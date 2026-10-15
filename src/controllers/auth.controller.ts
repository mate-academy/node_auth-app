import type { RequestHandler, Response as ExpressResponse } from 'express';
import { User } from '../models/user.js';
import { mailer } from '../services/email.service.js';
import { v4 as uuidV4 } from 'uuid';
import bcrypt from 'bcrypt';
import { UniqueConstraintError } from 'sequelize';
import { NormalizedUser, userService } from '../services/user.service.js';
import { jwt } from '../utils/jwt.js';

function setRefreshCookie(res: ExpressResponse, user: User) {
  const refreshToken = jwt.generateRefreshToken(userService.normalize(user));
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,
  });
}

async function sendAuthentication(res: ExpressResponse, user: User) {
  const userData = userService.normalize(user);
  const accessToken = jwt.generateAccessToken(userData);
  const refreshToken = jwt.generateRefreshToken(userData);

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

const register: RequestHandler = async (req, res) => {
  // res.json({ user: null });
  const { email, password, name } = req.body;

  const errors = {
    name: userService.validateName(name),
    email: userService.validateEmail(email),
    password: userService.validatePassword(password),
  };

  if (Object.values(errors).some((error) => error)) {
    res.status(400).json({
      errors,
      ...(errors.password && { passwordRules: userService.passwordRules }),
      message: 'Validation error',
    });

    return;
  }

  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    res.status(409).json({
      errors: { email: 'Email is already taken' },
      message: 'Validation error',
    });

    return;
  }

  const activationToken = uuidV4();
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  try {
    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      activationToken,
    });

    await mailer.sendActivationLink(email, activationToken);

    res.status(201).send(userService.normalize(newUser));
  } catch (e) {
    if (e instanceof UniqueConstraintError) {
      res.status(409).json({
        errors: { email: 'Email is already taken' },
        message: 'Validation error',
      });

      return;
    }

    throw e;
  }
};

const activate: RequestHandler = async (req, res) => {
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
  setRefreshCookie(res, user);
  res.redirect('/profile');
};

const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);
  const isPasswordValid = await bcrypt.compare(password, user?.password || '');

  if (!user || !isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (user.activationToken) {
    res.status(403).json({ message: 'Please activate your email' });

    return;
  }

  await sendAuthentication(res, user);
};

const logout: RequestHandler = async (req, res) => {
  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

const refresh: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = jwt.validateRefreshToken(refreshToken) as NormalizedUser;

  if (!userData) {
    res.status(401).json({ message: 'Invalid token' });

    return;
  }

  const user = await userService.findByEmail(userData.email);

  if (!user) {
    res.status(401).json({ message: 'Invalid token' });

    return;
  }

  await sendAuthentication(res, user);
};

const requestPasswordReset: RequestHandler = async (req, res) => {
  const email = String(req.body.email ?? '')
    .trim()
    .toLowerCase();
  const emailError = userService.validateEmail(email);

  if (emailError) {
    res.status(400).json({
      errors: { email: emailError },
      message: 'Validation error',
    });

    return;
  }

  const user = await userService.findByEmail(email);

  if (user) {
    user.resetToken = uuidV4();
    await user.save();

    await mailer.sendPasswordResetLink(user.email, user.resetToken);
  }

  // одинаковый ответ, чтобы нельзя было узнать, какие email зарегистрированы
  res.json({ message: 'If this email is registered, a reset link was sent' });
};

const checkResetToken: RequestHandler = async (req, res) => {
  const { resetToken } = req.params;
  const user = await User.findOne({ where: { resetToken } });

  if (!user) {
    res.status(404).json({ message: 'Wrong or expired reset link' });

    return;
  }

  res.json({ message: 'Reset token is valid' });
};

const confirmPasswordReset: RequestHandler = async (req, res) => {
  const { resetToken, password, confirmation } = req.body;

  const errors = {
    password: userService.validatePassword(password),
    confirmation: userService.validatePasswordConfirmation(
      password,
      confirmation,
    ),
  };

  if (Object.values(errors).some((error) => error)) {
    res.status(400).json({
      errors,
      ...(errors.password && { passwordRules: userService.passwordRules }),
      message: 'Validation error',
    });

    return;
  }

  if (typeof resetToken !== 'string' || !resetToken) {
    res.status(404).json({ message: 'Wrong or expired reset link' });

    return;
  }

  const user = await User.findOne({ where: { resetToken } });

  if (!user) {
    res.status(404).json({ message: 'Wrong or expired reset link' });

    return;
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = null;
  await user.save();

  res.json({ message: 'Password was changed' });
};

const resetSuccess: RequestHandler = (req, res) => {
  res.json({ message: 'Password was reset. You can log in now' });
};

export const authController = {
  register,
  activate,
  login,
  logout,
  refresh,
  requestPasswordReset,
  checkResetToken,
  confirmPasswordReset,
  resetSuccess,
};
