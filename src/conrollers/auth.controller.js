/* eslint-disable max-len */
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { compare, genSalt, hash } from 'bcrypt';

const transporter = nodemailer.createTransport({
  host: 'givotkov11@gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'maddison53@ethereal.email',
    pass: 'jn7jnAPss4f63QBp6D',
  },
});

const KEY_EMAIL_PROOF = process.env.KEY_EMAIL_PROOF;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const prisma = new PrismaClient();

function generateAccessToken(payload) {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' }); // Access токен на 15 минут
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' }); // Refresh токен на 7 дней
}

async function verifyEmail(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Декодируем токен
    const decoded = jwt.verify(token, KEY_EMAIL_PROOF);
    const { email } = decoded;

    // Находим пользователя по email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Обновляем статус email в базе данных
    await prisma.user.update({
      where: { email },
      data: { isEmailVerified: true },
    });

    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function resetPassword(req, res) {
  try {
    const { email } = req.body;

    // Валидация email
    const emailError = validateEmail(email);

    if (emailError) {
      return res.status(400).json({ error: emailError.message });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Генерация токена для сброса пароля
    const token = jwt.sign({ email }, KEY_EMAIL_PROOF, { expiresIn: '1h' });

    // Отправка письма с токеном для сброса пароля
    const resetLink = `https://example.com/reset-password?token=${token}`;

    await transporter.sendMail({
      from: '"Example App" <no-reply@example.com>',
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Click the link below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>`,
    });

    return res.status(200).json({
      message: 'Password reset email sent. Please check your inbox.',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function confirmResetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: 'Token and new password are required' });
    }

    // Валидация пароля
    const passwordError = validatePassword(newPassword);

    if (passwordError) {
      return res.status(400).json({ error: passwordError.message });
    }

    // Декодирование токена
    const decoded = jwt.verify(token, KEY_EMAIL_PROOF);
    const { email } = decoded;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Хеширование нового пароля
    const salt = await genSalt(10);
    const newPasswordHash = await hash(newPassword, salt);

    // Обновляем пароль пользователя
    await prisma.user.update({
      where: { email },
      data: { password_hash: newPasswordHash },
    });

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function register(req, res) {
  try {
    const { password, email } = req.body;

    // Валидация email
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError) {
      return res.status(400).json({ error: emailError.message });
    }

    if (passwordError) {
      return res.status(400).json({ error: passwordError.message });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Генерация токена подтверждения
    const token = jwt.sign({ email }, KEY_EMAIL_PROOF, { expiresIn: '1h' });

    // Отправка письма с токеном
    const verificationLink = `https://example.com/verify-email?token=${token}`;

    await transporter.sendMail({
      from: '"Example App" <no-reply@example.com>',
      to: email,
      subject: 'Email Verification',
      html: `<p>Click the link below to verify your email:</p>
             <a href="${verificationLink}">${verificationLink}</a>`,
    });

    const salt = await genSalt(10);
    const psHash = await hash(password, salt);

    await prisma.user.create({
      data: {
        email: email,
        password_hash: psHash,
      },
    });

    return res.status(201).json({
      message: 'Registration successful. Please check your email to verify.',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function login(req, res) {
  try {
    const { password, email } = req.body;

    // Валидация email
    const emailError = validateEmail(email);

    if (emailError) {
      return res.status(400).json({ error: emailError.message });
    }

    // Валидация пароля
    const passwordError = validatePassword(password);

    if (passwordError) {
      return res.status(400).json({ error: passwordError.message });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isValidPassword = await compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Генерация токенов
    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Сохранение Refresh токена в базе данных
    await prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: refreshToken },
    });

    return res.status(200).json({
      message: 'Login successful',
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function logout(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    await prisma.user.updateMany({
      where: { refresh_token: refreshToken },
      data: { refresh_token: null },
    });

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function refreshAccessToken(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const user = await prisma.user.findUnique({
      where: { refresh_token: refreshToken },
    });

    if (!user) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, payload) => {
      if (err) {
        return res
          .status(401)
          .json({ error: 'Invalid or expired refresh token' });
      }

      const accessToken = generateAccessToken({ userId: user.id });

      return res.status(200).json({ accessToken });
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function validatePassword(password) {
  if (typeof password !== 'string') {
    return new Error('Password should be a string');
  }

  if (password.length < 8) {
    return new Error('Password must be at least 8 characters long');
  }

  return null;
}

function validateEmail(email) {
  if (typeof email !== 'string') {
    throw new Error('Email should be a string');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  return null;
}

export const authController = {
  register,
  login,
  logout,
  refreshAccessToken,
  verifyEmail,
  resetPassword,
  confirmResetPassword,
};