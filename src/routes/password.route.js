import express from 'express';
import { ApiError } from '../exeptions/api.errors.js';
import { User } from '../models/user.js';

import { catchError } from '../utils/catchError.js';
import { emailService } from '../services/email.service.js';
import { JWTService } from '../services/jwt.service.js';
import bcrypt from 'bcrypt';
import { validatePassword } from '../utils/validate.js';

export const pasRouter = new express.Router();

pasRouter.get('/reset-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw ApiError.badRequest('Email is required!', {
      email: 'Email is required',
    });
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw ApiError.notFound({
      user: 'User not found!',
    });
  }
  const token = JWTService.signReset(user);

  user.resetToken = token;
  await user.save();

  emailService.sendResetLink(user.name, email, token);
  res.send(user);
});

pasRouter.post(
  '/reset-password/:resetToken',
  catchError(async (req, res) => {
    const { newPassword, confirmation } = req.body;
    const { resetToken } = req.params;

    if (!resetToken) {
      throw ApiError.badRequest('Reset token is required');
    }
    if (!newPassword || !confirmation) {
      throw ApiError.badRequest('New password and confirmation are required');
    }
    if (newPassword !== confirmation) {
      throw ApiError.badRequest('Passwords do not match');
    }

    const user = await User.findOne({ where: { resetToken } });
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (validatePassword(newPassword)) {
      throw ApiError.badRequest('Password is not valid');
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    user.password = hashedPassword;
    user.resetToken = null;
    await user.save();

    res.send('Password has been successfully reset.');
  }),
);
