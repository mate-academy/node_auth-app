import type { RequestHandler } from 'express';
import { AppError } from '../../errors/AppError.js';
import { profileService } from './profile.service.js';

type ConfirmEmailParams = {
  token: string;
};

const getProfile: RequestHandler = async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new AppError(401, 'Unauthorized');
  }

  const profile = await profileService.getProfile(user.id);

  res.json({ user: profile });
};

const updateName: RequestHandler = async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new AppError(401, 'Unauthorized');
  }

  const name = req.body?.name;

  const updatedUser = await profileService.updateName(user.id, name);

  res.json({ user: updatedUser });
};

const changePassword: RequestHandler = async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new AppError(401, 'Unauthorized');
  }

  await profileService.changePassword(user.id, req.body);

  res.status(204).send();
};

const changeEmail: RequestHandler = async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new AppError(401, 'Unauthorized');
  }

  await profileService.changeEmail(user.id, req.body);

  res.json({
    message:
      'Email change confirmation has been sent to your new email address',
  });
};

const confirmEmailChange: RequestHandler<ConfirmEmailParams> = async (
  req,
  res,
) => {
  const { token } = req.params;

  const user = await profileService.confirmEmailChange(token);

  res.json({
    user,
    message: 'Email has been changed successfully',
  });
};

export const profileController = {
  getProfile,
  updateName,
  changePassword,
  changeEmail,
  confirmEmailChange,
};
