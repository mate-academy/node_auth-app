import { ApiError } from '../exeptions/api.error.js';
import { User } from '../modules/User.js';
import { userService } from '../service/user.service.js';
import bcrypt from 'bcrypt';

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();

  res.send(users.map(userService.normalize));
};

const changeName = async (req, res) => {
  const { userName } = req.params;
  const { newName } = req.body;

  if (!userName || !newName) {
    throw ApiError.badRequest('Something wrong');
  }

  await userService.changeName(userName, newName);
  res.send('Name change sucssessfull');
};

const changePassword = async (req, res) => {
  const { userName } = req.params;
  const { oldPassword, newPassword, confirmation } = req.body;

  const user = await User.findOne({ where: { userName } });

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong old password');
  }

  if (!userName) {
    throw ApiError.badRequest('Something wrong');
  }

  if (newPassword !== confirmation) {
    res.status(400).send('Passwords do not match');

    return;
  }

  const hashPass = await bcrypt.hash(newPassword, 10);

  await userService.changePassword(userName, hashPass);
  res.send('Password change sucssessfull');
};

const changeEmail = async (req, res) => {
  const { userName } = req.params;
  const { password, newEmail } = req.body;

  const user = await User.findOne({ where: { userName } });

  if (!user) {
    throw ApiError.badRequest('Error not found user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  await userService.changeEmail(userName, newEmail);

  res.send('Send activation link to your new email');
};

const activationNewEmail = async (req, res) => {
  const { email, resetToken } = req.params;

  const user = await User.findOne({ where: { resetToken } });

  if (!user || !resetToken) {
    throw ApiError.badRequest('Invalid reset token or user not found');
  }

  user.email = email;
  user.resetToken = null;

  await user.save();

  res.send('Email change sucssessfull');
};

export const userController = {
  getAllActivated,
  changeName,
  changePassword,
  changeEmail,
  activationNewEmail,
};
