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

export const userService = {
  getAllActive,
  normalize,
  getByEmail,
  register,
  requestPasswordReset,
  resetPassword,
};
