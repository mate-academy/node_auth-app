import { authService } from '../services/auth.service.js';
import { userService } from '../services/user.service.js';

const getProfile = async (req, res) => {
  const { refreshToken } = req.cookies;
  const profile = await userService.getProfile(req.userId, refreshToken);

  res.send(profile);
};

const updateName = async (req, res) => {
  const { name } = req.body;
  const { refreshToken } = req.cookies;

  await authService.updateName(req.userId, name, refreshToken);

  res.send({ message: 'Name changed successfully' });
};

const updatePassword = async (req, res) => {
  const { password, newPassword, confirmation } = req.body;
  const { refreshToken } = req.cookies;

  await authService.updatePassword(
    refreshToken,
    req.userId,
    password,
    newPassword,
    confirmation,
  );

  res.clearCookie('refreshToken');
  res.send({ message: 'Password changed successfully' });
};

const updateEmailNotification = async (req, res) => {
  const { newEmail, password } = req.body;
  const { refreshToken } = req.cookies;

  await authService.updateEmailNotification(
    refreshToken,
    req.userId,
    newEmail,
    password,
  );

  res.send({ message: 'Change email notification sent' });
};

export const userController = {
  getProfile,
  updateName,
  updatePassword,
  updateEmailNotification,
};
