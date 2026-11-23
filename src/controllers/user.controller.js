import { User } from '../models/user.js';
import { userService } from '../services/user.service.js';
import { ApiError } from '../exceptions/api.error.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from '../services/email.service.js';
import { tokenService } from '../services/token.service.js';
import { Op } from 'sequelize';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const updateName = async (req, res) => {
  const { name } = req.body;

  if (typeof name !== 'string' || !name.trim()) {
    throw ApiError.badRequest('Name is required');
  }

  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw ApiError.unathorized();
  }

  user.name = name.trim();
  await user.save();

  res.send(userService.normalize(user));
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmation } = req.body;

  if (typeof oldPassword !== 'string' || !oldPassword) {
    throw ApiError.badRequest('Old password is required');
  }

  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    throw ApiError.badRequest('New password must be at least 6 characters');
  }

  if (newPassword !== confirmation) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw ApiError.unathorized();
  }

  const isOldValid = await bcrypt.compare(oldPassword, user.password);

  if (!isOldValid) {
    throw ApiError.badRequest('Old password is incorrect');
  }

  if (oldPassword === newPassword) {
    throw ApiError.badRequest('New password must differ from the old one');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.send({ message: 'OK' });
};

const requestEmailChange = async (req, res) => {
  const { password, newEmail } = req.body;

  if (typeof password !== 'string' || !password) {
    throw ApiError.badRequest('Password is required');
  }

  if (typeof newEmail !== 'string' || !EMAIL_REGEX.test(newEmail)) {
    throw ApiError.badRequest('Invalid email');
  }

  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw ApiError.unathorized();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Password is incorrect');
  }

  if (newEmail === user.email) {
    throw ApiError.badRequest('This is already your email');
  }

  const existing = await userService.findByEmail(newEmail);

  if (existing) {
    throw ApiError.badRequest('This email is already taken');
  }

  user.pendingEmail = newEmail;
  user.emailChangeToken = uuidv4();
  user.emailChangeExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  await emailService.sendEmailChangeConfirmation(
    newEmail,
    user.emailChangeToken,
  );

  res.send({ message: 'OK' });
};

const confirmEmailChange = async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    where: {
      emailChangeToken: token,
      emailChangeExpires: { [Op.gt]: new Date() },
    },
  });

  if (!user || !user.pendingEmail) {
    throw ApiError.badRequest('This link is invalid or has expired');
  }

  const existing = await userService.findByEmail(user.pendingEmail);

  if (existing) {
    throw ApiError.badRequest('This email is already taken');
  }

  const oldEmail = user.email;
  const newEmail = user.pendingEmail;

  user.email = newEmail;
  user.pendingEmail = null;
  user.emailChangeToken = null;
  user.emailChangeExpires = null;
  await user.save();

  await tokenService.remove(user.id);
  res.clearCookie('refreshToken');

  await emailService.sendEmailChangedNotification(oldEmail, newEmail);

  res.send({ message: 'OK' });
};

export const userController = {
  updateName,
  changePassword,
  confirmEmailChange,
  requestEmailChange,
};
