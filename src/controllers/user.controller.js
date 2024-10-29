import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { userService } from '../services/user.service.js';
import bcrypt from 'bcrypt';

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();

  res.send(users.map(userService.normalize));
};

const getProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id);

  res.send(user);
};

const changeName = async (req, res) => {
  const { newName } = req.body;

  if (!newName) {
    throw res.send(ApiError.badRequest('New name is required'));
  }

  const user = await User.findByPk(req.user.id);
  user.name = newName;
  await user.save();

  res.send({message: 'Message sent successfully', user});
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw ApiError.badRequest('All fields are required');
  }

  const user = await User.findByPk(req.user.id);
  const isMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isMatch) {
    throw ApiError.badRequest('Old and new passwords do not match');
  }

  if (newPassword !== confirmPassword) {
    throw ApiError.badRequest('New passwords do not match');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.send({message: 'Password changed successfully', user});
};

const changeEmail = async (req, res) => {
  const { password, newEmail } = req.body;

  if (!password || !newEmail) {
    throw ApiError.badRequest('All fields are required');
  }

  const user = await User.findByPk(req.user.id);

  const isCorrectPassword = await bcrypt.compare(password, user.password);

  if (!isCorrectPassword) {
    throw ApiError.badRequest('Password is incorrect');
  }

  const oldUserEmail = user.email; // old email

  user.email = newEmail;
  await user.save();

  emailService.sendWarningEmail(oldUserEmail); // send email to old user

  res.send({message: 'Email was succesfully updated', user});
};

export const userController = {
  getAllActivated,
  getProfile,
  changeName,
  changePassword,
  changeEmail,
};
