import { userService } from '../services/user.service.js';
import { ApiError } from '../exeptions/api.error.js';

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();
  res.send(users.map(user => userService.normalize(user)));
};

const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const updatedUser = await userService.updateProfile(userId, req.body);

  res.send(updatedUser);
};

const changePassword = async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword, confirmation } = req.body;

  if (newPassword !== confirmation) {
    throw ApiError.BadRequest('Passwords do not match');
  }

  await userService.changePassword(userId, oldPassword, newPassword);

  res.send({ message: 'Password changed successfully' });
};

const changeEmail = async (req, res) => {
  const userId = req.user.id;
  const { password, newEmail } = req.body;

  await userService.changeEmail(userId, newEmail, password);

  res.send({ message: 'Email changed successfully' });
};

export const userController = {
  getAllActivated,
  updateProfile,
  changePassword,
  changeEmail,
};
