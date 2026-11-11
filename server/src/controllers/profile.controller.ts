import type { Request, Response } from 'express';
import { ApiError } from '../exceptions/ApiError';
import { userService } from '../services/user.service';
import { REFRESH_COOKIE } from '../utils/cookies';
import {
  validateEmail,
  validateName,
  validatePassword,
} from '../utils/validation';

async function getProfile(req: Request, res: Response) {
  const user = await userService.findById(req.user!.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.json(userService.normalize(user));
}

async function updateName(req: Request, res: Response) {
  const { name } = req.body ?? {};
  const nameError = validateName(name);

  if (nameError) {
    throw ApiError.badRequest('Validation error', { name: nameError });
  }

  const user = await userService.updateName(req.user!.id, name.trim());

  res.json(user);
}

async function changePassword(req: Request, res: Response) {
  const { oldPassword, newPassword, confirmation } = req.body ?? {};
  const errors: Record<string, string> = {};

  if (typeof oldPassword !== 'string' || !oldPassword) {
    errors.oldPassword = 'Old password is required';
  }

  const newPasswordError = validatePassword(newPassword);

  if (newPasswordError) {
    errors.newPassword = newPasswordError;
  }

  if (newPassword !== confirmation) {
    errors.confirmation = 'Passwords do not match';
  }

  if (Object.keys(errors).length) {
    throw ApiError.badRequest('Validation error', errors);
  }

  await userService.changePassword(
    req.user!.id,
    oldPassword,
    newPassword,
    req.cookies?.[REFRESH_COOKIE],
  );

  res.json({ message: 'Password has been changed' });
}

async function changeEmail(req: Request, res: Response) {
  const { password, newEmail, confirmation } = req.body ?? {};
  const errors: Record<string, string> = {};

  if (typeof password !== 'string' || !password) {
    errors.password = 'Password is required';
  }

  const emailError = validateEmail(newEmail);

  if (emailError) {
    errors.newEmail = emailError;
  } else if (
    newEmail.trim().toLowerCase() !==
    String(confirmation ?? '')
      .trim()
      .toLowerCase()
  ) {
    errors.confirmation = 'Emails do not match';
  }

  if (Object.keys(errors).length) {
    throw ApiError.badRequest('Validation error', errors);
  }

  const user = await userService.changeEmail(
    req.user!.id,
    password,
    newEmail.trim().toLowerCase(),
  );

  res.json(user);
}

export const profileController = {
  getProfile,
  updateName,
  changePassword,
  changeEmail,
};
