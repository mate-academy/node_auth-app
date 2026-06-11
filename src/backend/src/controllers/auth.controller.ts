import type { Request, Response } from 'express';
import { prisma } from '../lib/db.js';
import {
  sendActivationEmail,
  sendResetPasswordEmail,
} from '../services/email.service.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { jwtService } from '../services/jwt.service.js';
import { PublicUser, userService } from '../services/user.service.js';

const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    const expiringTime = new Date(Date.now() + 30 * 60 * 1000);
    const token = crypto.randomBytes(32).toString('hex');
    const userExists = await prisma.user.findUnique({
      where: { email: email },
    });

    if (userExists) {
      return res
        .status(400)
        .json({ error: 'User with this email already exists' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        activationToken: token,
        activationTokenExpiring: expiringTime,
      },
    });

    sendActivationEmail(email, token);
    res.json({
      message: 'Check your email for verification',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'server error' });
  }
};

const activate = async (req: Request, res: Response) => {
  const tokenFromUser = req.query.token;

  if (typeof tokenFromUser !== 'string') {
    return res.status(400).json({ error: 'Token is required' });
  }

  const user = await prisma.user.findFirst({
    where: {
      activationToken: tokenFromUser,
      activationTokenExpiring: { gt: new Date() },
    },
  });

  if (user?.isActivated === true) {
    return res.status(400).json({ error: 'user already activated' });
  }
  if (!user) {
    return res.status(404).json({ error: 'Invalid token or timed out' });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isActivated: true,
      activationToken: null,
      activationTokenExpiring: null,
    },
  });

  res.json({ message: 'Successful activation' });
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ error: 'Wrong email or password' });
  }
  if (!user.isActivated) {
    return res.status(401).json({ error: 'Account not verified' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Wrong email or password' });
  }

  const normalizedUser = userService.normalize(user);

  await generateTokens(res, normalizedUser);
};

const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token' });
  }

  const tokenInDb = await prisma.refreshTokens.findUnique({
    where: { token: refreshToken },
  });
  if (!tokenInDb) {
    return res.status(401).json({ error: 'invalid refresh token' });
  }

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData || typeof userData === 'string') {
    await prisma.refreshTokens.delete({ where: { token: refreshToken } });
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  await prisma.refreshTokens.delete({ where: { token: refreshToken } });

  const { iat, exp, ...cleanUser } = userData as PublicUser & {
    iat?: number;
    exp?: number;
  };

  await generateTokens(res, cleanUser as PublicUser);
};

const generateTokens = async (res: Response, user: PublicUser) => {
  const accesToken = jwtService.sign(user);
  const refreshToken = jwtService.signRefresh(user);

  await prisma.refreshTokens.create({
    data: {
      token: refreshToken,
      userId: user.id,
    },
  });

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.json({
    message: 'Successfull login!',
    user: user,
    token: accesToken,
  });
};

const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    await prisma.refreshTokens.deleteMany({
      where: { token: refreshToken },
    });
  }

  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.json({
      message: 'If this email exists, you will receive a reset link',
    });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiring = new Date(Date.now() + 30 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiring: expiring },
  });

  sendResetPasswordEmail(email, token);

  res.json({ message: 'If this email exists, you will receive a reset link' });
};

const confirmPasswordReset = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiring: { gt: new Date() },
    },
  });

  if (!user) {
    return res.status(404).json({ error: 'Invalid token or timed out' });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiring: null,
    },
  });

  res.json({ message: 'Password successfully reset' });
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  requestPasswordReset,
  confirmPasswordReset,
};
