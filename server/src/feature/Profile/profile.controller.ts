import type { Response, Request } from 'express';
import type { AuthRequest } from '../../middlewares/authMiddleware.js';
import { profileService } from './profile.service.js';

const getOwner = async (req: Request, res: Response) => {
  const user = await profileService.getOwner(res.locals.user.id);

  return res.status(200).json(user);
};

const changeName = async (req: Request, res: Response) => {
  const { name } = req.body;

  await profileService.changeName(res.locals.user.id, name);

  return res.sendStatus(204);
};

const changePassword = async (req: Request, res: Response) => {
  const { oldPassword, newPassword, confirmation } = req.body;

  const data = await profileService.changePassword(
    res.locals.user.id,
    oldPassword,
    newPassword,
    confirmation,
  );

  return res.status(200).json(data);
};

const changeEmail = async (req: Request, res: Response) => {
  const { newEmail, password, emailConfirmation } = req.body;

  const data = await profileService.changeEmail(
    res.locals.user.id,
    newEmail,
    password,
    emailConfirmation,
  );

  return res.status(200).json(data);
};

export const profileController = {
  getOwner,
  changeName,
  changePassword,
  changeEmail,
};
