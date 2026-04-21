import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { emailService } from '../services/emailService.js';
import { ApiError } from '../exceptions/ApiError.js';
import { User } from '../models/User.js';

function getAllActive() {
  return User.findAll({
    where: { activationToken: null },
    order: ['id'],
  });
}

function getByEmail(email) {
  return User.findOne({
    where: { email },
  });
}

function getById(id) {
  return User.findByPk(id);
}

function normalize({ id, name, email }) {
  return { id, name, email };
}

async function register({ name, email, password }) {
  const existingUser = await getByEmail(email);

  if (existingUser) {
    throw ApiError.BadRequest('Validation error', {
      email: 'Email is already taken',
    });
  }

  const activationToken = uuidv4();
  const hash = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hash,
    activationToken,
  });

  await emailService.sendActivationLink(email, activationToken);
}

async function requestPasswordReset(email) {
  const user = await getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User with this email does not exist');
  }

  const passwordResetToken = uuidv4();

  user.passwordResetToken = passwordResetToken;
  await user.save();

  await emailService.sendPasswordResetLink(email, passwordResetToken);
}

async function resetPassword(passwordResetToken, password) {
  const user = await User.findOne({ where: { passwordResetToken } });

  if (!user) {
    throw ApiError.BadRequest('Invalid or expired reset link');
  }

  user.password = await bcrypt.hash(password, 10);
  user.passwordResetToken = null;
  await user.save();
}

async function changeName(userId, name) {
  const user = await User.findByPk(userId);

  user.name = name;
  await user.save();

  return normalize(user);
}

async function changePassword(userId, oldPassword, newPassword) {
  const user = await User.findByPk(userId);
  const isValid = await bcrypt.compare(oldPassword, user.password);

  if (!isValid) {
    throw ApiError.BadRequest('Validation error', {
      oldPassword: 'Wrong password',
    });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
}

async function changeEmail(userId, password, newEmail) {
  const user = await User.findByPk(userId);
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw ApiError.BadRequest('Validation error', {
      password: 'Wrong password',
    });
  }

  const existing = await getByEmail(newEmail);

  if (existing) {
    throw ApiError.BadRequest('Validation error', {
      email: 'Email is already taken',
    });
  }

  const confirmationToken = uuidv4();
  const oldEmail = user.email;

  user.newEmail = newEmail;
  user.activationToken = confirmationToken;
  await user.save();

  await emailService.sendEmailChangeConfirmation(newEmail, confirmationToken);
  await emailService.sendEmailChangeNotification(oldEmail, newEmail);
}

export const userService = {
  getAllActive,
  normalize,
  getByEmail,
  getById,
  register,
  requestPasswordReset,
  resetPassword,
  changeName,
  changePassword,
  changeEmail,
};
