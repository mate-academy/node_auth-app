import { authService } from '../services/auth.service.js';
import { userService } from '../services/user.service.js';

const getProfile = async (req, res) => {
  const profile = await userService.getProfile(req.userId);

  res.send(profile);
};

const updateName = async (req, res) => {
  const { name } = req.body;

  await authService.updateName(req.userId, name);

  res.send({ message: 'Name changed successfully' });
};

const updatePassword = async (req, res) => {
  const { password, newPassword } = req.body;

  await authService.updatePassword(req.userId, password, newPassword);

  res.clearCookie('refreshToken');
  res.send({ message: 'Password changed successfully' });
};

const requestEmailChange = async (req, res) => {
  const { newEmail, password } = req.body;

  await authService.requestEmailChange(req.userId, newEmail, password);

  res.send({ message: 'Change email notification sent' });
};

const unlinkSocialAccount = async (req, res) => {
  const { provider } = req.params;

  await authService.unlinkSocialAccount(req.userId, provider);

  res.send({ message: `${provider} account unlinked successfully` });
};

export const userController = {
  getProfile,
  updateName,
  updatePassword,
  requestEmailChange,
  unlinkSocialAccount,
};
