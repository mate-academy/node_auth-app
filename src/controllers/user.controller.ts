import { RequestHandler } from 'express';
import { userService } from '../services/user.service.js';

const changeName: RequestHandler = async (req, res) => {
  const user = req.user!;
  const { newName } = req.body;

  await userService.changeName(user, newName);

  res.json({ message: 'OK' });
};

const changePassword: RequestHandler = async (req, res) => {
  const user = req.user!;
  const { password, newPassword, passwordConfirmation } = req.body;

  const normalizedUser = await userService.changePassword(
    user,
    password,
    newPassword,
    passwordConfirmation,
  );

  res.json({
    message: 'OK',
    user: normalizedUser,
  });
};

export const userController = {
  changeName,
  changePassword,
};
