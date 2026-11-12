import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/authMiddleware.js";
import { profileService } from "./profile.service.js";

const getOwner = async (req: AuthRequest, res: Response) => {
  const user = await profileService.getOwner(req.user.id);

  return res.status(200).json(user);
};

const changeName = async (req: AuthRequest, res: Response) => {
  const { name } = req.body;

  await profileService.changeName(req.user.id, name);

  return res.sendStatus(204);
};

const changePassword = async (req: AuthRequest, res: Response) => {
  const { oldPassword, newPassword, confirmation } = req.body;

  const data = await profileService.changePassword(
    req.user.id,
    oldPassword,
    newPassword,
    confirmation,
  );

  return res.status(200).json(data);
};

const changeEmail = async (req: AuthRequest, res: Response) => {
  const { newEmail, password, emailConfirmation } = req.body;

  const data = await profileService.changeEmail(
    req.user.id,
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

