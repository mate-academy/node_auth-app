import prisma from '../prisma/prismaClient.js';
import bcrypt from 'bcrypt';
import nodeCrypto from 'crypto';
import { validatePassword } from '../utils/passwordValidator.js';
import {
  sendEmailChangeNotification,
  sendEmailConfirmationEmail,
} from '../services/email.service.js';

export async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        newEmail: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function changeName(req, res, next) {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name: name.trim() },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    validatePassword(newPassword);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const isValid = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!isValid) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
}

export async function changeEmail(req, res, next) {
  try {
    const { password, newEmail } = req.body;

    if (!password || !newEmail) {
      return res.status(400).json({
        message: 'Password and new email are required',
      });
    }

    const normalizedNewEmail = newEmail.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedNewEmail },
    });

    if (existing) {
      return res.status(400).json({ message: 'Email already taken' });
    }

    const token = nodeCrypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { newEmail: normalizedNewEmail },
    });

    await prisma.token.create({
      data: {
        token,
        type: 'CHANGE_EMAIL',
        expiresAt,
        userId: req.user.id,
      },
    });

    const confirmLink = `http://localhost:3000/profile/confirm-email/${token}`;

    await sendEmailChangeNotification(user.email, normalizedNewEmail);
    await sendEmailConfirmationEmail(normalizedNewEmail, confirmLink);

    res.json({
      message: 'Confirmation email sent to your new email address',
    });
  } catch (error) {
    next(error);
  }
}

export async function confirmNewEmail(req, res, next) {
  try {
    const { token } = req.params;

    const emailToken = await prisma.token.findFirst({
      where: {
        token,
        type: 'CHANGE_EMAIL',
      },
    });

    if (!emailToken) {
      return res.status(404).json({
        message: 'Invalid email confirmation token',
      });
    }

    if (emailToken.expiresAt < new Date()) {
      return res.status(400).json({
        message: 'Email confirmation token expired',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: emailToken.userId },
    });

    if (!user || !user.newEmail) {
      return res.status(400).json({
        message: 'No pending email change found',
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.newEmail,
        newEmail: null,
      },
    });

    await prisma.token.delete({
      where: { id: emailToken.id },
    });

    res.json({ message: 'Email confirmed successfully' });
  } catch (error) {
    next(error);
  }
}
