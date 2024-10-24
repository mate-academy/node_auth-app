import bcrypt from 'bcrypt';
import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import { profileService } from '../services/profile.service.js';
import { emailService } from '../services/email.service.js';

const getAllInfo = async (req, res) => {
  const users = await profileService.getAllInfo();

  res.send(users.map(profileService.normalize));
};

const getProfile = async (req, res) => {
  const user = await User.findOne({ where: { id: req.user.id } });

  if (!user) {
    throw ApiError.unauthorized('User not found');
  }
  res.send(profileService.normalize(user));
};

const changeName = async (req, res) => {
  const { newName } = req.body;
  const userId = req.user.id;

  if (!newName) {
    throw ApiError.badRequest('Enter new name');
  }

  const user = await User.findOne({ where: { userId } });

  if (!user) {
    throw ApiError.unauthorized('Please authorize');
  }

  const updatedUser = await profileService.updateUserData({ newName }, user.id);

  res.status(200).send(updatedUser);
};

const changeEmail = async (req, res) => {
  const { newEmail, confEmail, password } = req.body;
  const userId = req.userId;

  if (!newEmail || !confEmail) {
    throw ApiError.badRequest('Enter new email and confirmation');
  }

  if (newEmail !== confEmail) {
    throw ApiError.badRequest('Email and confirmation must be equal');
  }

  const user = await User.findOne({ where: { userId } });

  if (!user) {
    throw ApiError.unauthorized('Please authorize');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  await emailService.send(user.email, 'You have new email');

  const updatedUser = await profileService.updateUserData(
    { newEmail },
    user.id,
  );

  res.status(200).send(updatedUser);
};

const changePassword = async (req, res) => {
  const { password, newPassword, confPassword } = req.body;
  const userId = req.userId;

  if (!newPassword || !confPassword) {
    throw ApiError.badRequest('Enter new password and confirmation');
  }

  if (newPassword !== confPassword) {
    throw ApiError.badRequest('Password and confirmation must be equal');
  }

  const user = await User.findOne({ where: { userId } });

  if (!user) {
    throw ApiError.unauthorized('Please authorize');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong old password');
  }

  const newHashPassword = bcrypt.hash(newPassword);

  const updatedUser = await profileService.updateUserData(
    { newHashPassword },
    user.id,
  );

  res.status(200).send(updatedUser);
};

export const profileController = {
  getAllInfo,
  getProfile,
  changeName,
  changeEmail,
  changePassword,
};
