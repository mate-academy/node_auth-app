import { userService } from '../services/user.service.js';

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();

  res.send(users.map(userService.normalize));
};

const getProfile = async (req, res, next) => {
  const user = await userService.getUserById(req.user.id);

  return res.json(user);
};

const updateName = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  const updatedUser = await userService.updateName(userId, name);

  return res.json(updatedUser);
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user.id;

  await userService.updatePassword(
    userId,
    oldPassword,
    newPassword,
    confirmPassword,
  );

  return res.json({ message: 'Password has been successfully updated' });
};

const updateEmail = async (req, res) => {
  const { newEmail, newEmailConfirmation, password } = req.body;
  const userId = req.user.id;

  await userService.updateEmail(
    userId,
    newEmail,
    newEmailConfirmation,
    password,
  );

  return res.json({ message: 'Email has been successfully updated!' });
};

export const userController = {
  getAllActivated,
  getProfile,
  updateName,
  updatePassword,
  updateEmail,
};
