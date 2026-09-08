import { ApiError } from '../exeptions/api.error.js';
import { SocialAccount } from '../models/socialAccount.js';
import { User } from '../models/user.js';
import {
  validateEmail,
  validateName,
  validatePassword,
} from '../validators/auth.validator.js';
import { emailService } from './email.service.js';
import bcrypt from 'bcrypt';

const changeName = async ({ id, name }) => {
  const user = await User.findOne({ where: { id } });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const nameError = validateName(name);

  if (nameError) {
    throw ApiError.badRequest('Invalid name');
  }

  user.name = name;
  await user.save();

  return user;
};

const changePassword = async ({ id, oldPassword, password, confirmation }) => {
  const user = await User.findOne({ where: { id } });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong old password');
  }

  const passwordError = validatePassword(password);

  if (passwordError) {
    throw ApiError.badRequest('Invalid password');
  }

  if (password !== confirmation) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const hashedPass = await bcrypt.hash(password, 10);

  user.password = hashedPass;
  await user.save();

  await emailService.sendPasswordChangeNotification(user.email);

  return user;
};

const changeEmail = async ({ id, password, confirmation, email }) => {
  const user = await User.findOne({ where: { id } });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const oldEmail = user.email;

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  if (email !== confirmation) {
    throw ApiError.badRequest('Emails do not match');
  }

  const emailError = validateEmail(email);

  if (emailError) {
    throw ApiError.badRequest('Invalid email');
  }

  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    throw ApiError.badRequest('Email already exists');
  }

  user.email = email;
  await user.save();

  await emailService.sendEmailChangeNotification(oldEmail, email);

  return user;
};

const getProfile = async (userId) => {
  const user = await User.findOne({ where: { id: userId } });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const socialAccounts = await SocialAccount.findAll({
    where: { userId: user.id },
  });

  return { user, socialAccounts };
};

export const profileService = {
  changeName,
  changePassword,
  changeEmail,
  getProfile,
};
