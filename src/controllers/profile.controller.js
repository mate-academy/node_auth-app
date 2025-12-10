import { userService } from '../services/user.service.js';
import bcrypt from 'bcrypt';
import { ApiError } from '../exeptions/api.error.js';
import { sendEmail } from '../utils/email.js';

const getProfile = async (req, res) => {
  res.json(userService.normalize(req.user));
};

const updateName = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw ApiError.badRequest('Name is required');
  }

  req.user.name = name;
  await req.user.save();
  res.json({ message: 'Name updated', user: userService.normalize(req.user) });
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirm } = req.body;

  if (!oldPassword || !newPassword || !confirm) {
    throw ApiError.badRequest('All fields are required');
  }

  if (newPassword !== confirm) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const valid = await bcrypt.compare(oldPassword, req.user.password);

  if (!valid) {
    throw ApiError.badRequest('Old password is incorrect');
  }

  req.user.password = await bcrypt.hash(newPassword, 10);
  await req.user.save();

  res.json({ message: 'Password updated' });
};

const changeEmail = async (req, res) => {
  const { password, newEmail } = req.body;

  if (!password || !newEmail) {
    throw ApiError.badRequest('All fields are required');
  }

  const valid = await bcrypt.compare(password, req.user.password);

  if (!valid) {
    throw ApiError.badRequest('Password incorrect');
  }

  const oldEmail = req.user.email;

  req.user.email = newEmail;
  await req.user.save();

  await sendEmail(
    oldEmail,
    'Email changed',
    `Your email was changed to ${newEmail}`,
  );

  res.json({ message: 'Email updated', user: userService.normalize(req.user) });
};

export const profileController = {
  getProfile,
  updateName,
  changePassword,
  changeEmail,
};
