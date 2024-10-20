import { ApiError } from '../exceptions/api.error.js';
import { userService } from '../services/user.service.js';
import { User } from '../models/user.js';
import bcrypt from 'bcrypt';
import { validatePassword } from '../utils/methods.js';
import { emailService } from '../services/emai.services.js';
import jwt from 'jsonwebtoken';

const rename = async (req, res) => {
  const { newName, email } = req.body;

  if (!newName) {
    throw ApiError.badRequest('Bad request, need to provide new name of user');
  }

  const user = await userService.getByEmail(email);

  await User.update({ name: newName }, { where: { id: user.id } });

  res.status(200).send('Done');
};

const changePassword = async (req, res) => {
  const { email, password, newPassword, confirmationPassword } = req.body;
  const user = await userService.getByEmail(email);

  if (!email || !password || !newPassword || !confirmationPassword) {
    throw ApiError.badRequest('Need to provide all fields');
  }

  const isPasswordRight = await bcrypt.compare(password, user.password);

  if (!isPasswordRight) {
    throw ApiError.badRequest('Password is not right.');
  }

  const errors = {
    password: validatePassword(newPassword),
  };

  if (errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  if (newPassword !== confirmationPassword) {
    throw ApiError.badRequest('Password is not equal.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await User.update({ password: hashedPassword }, { where: { id: user.id } });

  res.status(200).send('Password changed.');
};

const changeEmail = async (req, res) => {
  const { email, password, newEmail } = req.body;

  if (!email || !password || !newEmail) {
    throw ApiError.badRequest('Need to provide all fields');
  }

  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.badRequest('User not found.');
  }

  const isPasswordRight = await bcrypt.compare(password, user.password);

  if (!isPasswordRight) {
    throw ApiError.badRequest('Password is not right.');
  }

  const existingUser = await userService.getByEmail(newEmail);

  if (existingUser) {
    throw ApiError.badRequest('The new email is already in use.');
  }

  await emailService.sendEmailChangedApprove(email, newEmail);

  res
    .status(200)
    .send('Email change confirmation sent. Please check your emails.');
};

const confirmEmailChange = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    throw ApiError.badRequest('Invalid or missing token.');
  }

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw ApiError.badRequest('Invalid or expired token.');
  }

  const { email, newEmail } = payload;

  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.badRequest('User not found.');
  }

  await User.update({ email: newEmail }, { where: { id: user.id } });

  await emailService.sendEmailChangedInfo(email, newEmail);

  res.status(200).send('Email successfully changed.');
};

export const ProfileController = {
  rename,
  changePassword,
  changeEmail,
  confirmEmailChange,
};
