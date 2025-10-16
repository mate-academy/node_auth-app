import { User } from '../models/User.js';
import { emailService } from '../services/email.service.js';
import { userService } from '../services/user.service';
import { ApiError } from '../utils/apiError.js';
import bcrypt from 'bcrypt';

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();

  res.send(users.map(userService.normalize));
};

const getProfile = async (req, res) => {
  const userId = req.user.id;

  const user = await User.findByPk(userId);

  if (!user) {
    return res.status(404).send({ message: 'User not found' });
  }

  const normalizedUser = userService.normalize(user);

  res.send(normalizedUser);
};

const changeName = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  if (!name || name.trim().length < 2) {
    throw ApiError.badRequest('Name must be at least 2 characters');
  }

  const user = await User.findByPk(userId);

  user.name = name;
  await user.save();

  res.send({ user: userService.normalize(user), message: 'Name update' });
};

const changePassword = async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    throw ApiError.badRequest('Passwords do not match');
  }

  if (newPassword && newPassword.length < 6) {
    throw ApiError.badRequest('Password must be at least 6 characters');
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound();
  }

  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isOldPasswordValid) {
    throw ApiError.badRequest('Old password is incorrect');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.send({ message: 'Password updated' });
};

const changeEmail = async (req, res) => {
  const userId = req.user.id;
  const { password, newEmail, confirmEmail } = req.body;

  if (newEmail !== confirmEmail) {
    throw ApiError.badRequest('New email and confirmation must match');
  }

  const user = await User.findByPk(userId);
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Password is incorrect');
  }

  const oldEmail = user.email;

  user.email = newEmail;
  await user.save();

  await emailService.send({
    email: oldEmail,
    subject: 'Your email was changed',
    html: `<p>Your account email has been changed to ${newEmail}</p>`,
  });

  res.send({ message: 'Email updated and old email notified' });
};

export const userController = {
  getAllActivated,
  getProfile,
  changeName,
  changePassword,
  changeEmail,
};
