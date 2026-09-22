import bcrypt from 'bcrypt';
import cryptoModules from 'crypto';
import { RequestHandler, Response as ExpressResponse } from 'express';
import { userService } from '../services/user.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { mailer } from '../utils/mailer';
import { validateEmail } from '../utils/validators';

const getAll: RequestHandler = async (req, res) => {
  const users = await userService.getAllActive();

  res.json(users.map(userService.normalize));
};

const getMe = async (req: AuthRequest, res: ExpressResponse) => {
  const user = await userService.getById(req.user!.id);

  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    });
  }

  res.json(userService.normalize(user));
};

const updateProfile = async (req: AuthRequest, res: ExpressResponse) => {
  const { name } = req.body;

  const updatedUser = await userService.updateName(req.user!.id, name);

  res.json(userService.normalize(updatedUser));
};

const updatePassword = async (req: AuthRequest, res: ExpressResponse) => {
  const { oldPassword, newPassword, confirmation } = req.body;

  if (!oldPassword || !newPassword || !confirmation) {
    return res.status(400).json({
      message: 'All password fields are required',
    });
  }

  if (newPassword !== confirmation) {
    return res.status(400).json({
      message: 'New password and confirmation do not match',
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      message: 'Password must contain at least 6 characters',
    });
  }

  try {
    const updatedUser = await userService.updatePassword(
      req.user!.id,
      oldPassword,
      newPassword,
    );

    res.json(userService.normalize(updatedUser));
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          message: error.message,
        });
      }

      if (error.message === 'Old password is incorrect') {
        return res.status(400).json({
          message: error.message,
        });
      }
    }

    res.status(500).json({
      message: 'Something went wrong',
    });
  }
};

const requestEmailChange = async (req: AuthRequest, res: ExpressResponse) => {
  const { password, newEmail } = req.body;

  if (!password || !newEmail) {
    return res.status(400).json({
      message: 'Password and new email are required',
    });
  }

  const normalizedEmail = newEmail.trim().toLowerCase();

  const emailError = validateEmail(normalizedEmail);

  if (emailError) {
    return res.status(400).json({
      message: emailError,
    });
  }

  const user = await userService.getById(req.user!.id);

  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({
      message: 'Invalid password',
    });
  }

  if (normalizedEmail === user.email) {
    return res.status(400).json({
      message: 'New email must be different',
    });
  }

  const existingUser = await userService.getByEmail(normalizedEmail);

  if (existingUser) {
    return res.status(409).json({
      message: 'Email is already in use',
    });
  }

  const emailChangeToken = cryptoModules.randomBytes(32).toString('hex');

  const emailChangeTokenExpires = new Date(Date.now() + 15 * 60 * 1000);

  await userService.setPendingEmail(
    user.id,
    normalizedEmail,
    emailChangeToken,
    emailChangeTokenExpires,
  );

  await mailer.sendEmailChangeConfirmation(normalizedEmail, emailChangeToken);

  res.json({
    message: 'Confirmation email has been sent',
  });
};

export const usersController = {
  getAll,
  getMe,
  updateProfile,
  updatePassword,
  requestEmailChange,
};
