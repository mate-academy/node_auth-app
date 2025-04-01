import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { emailService } from '../services/emailService.js';
import { ApiError } from '../exceptions/ApiError.js';
import { User } from '../models/User.js';

export function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }

  return true;
}

function getAllActive() {
  return User.findAll({
    where: { activationToken: null },
    order: ['id'],
  });
}

async function getOne(id) {
  return User.findOne({ where: id });
}

async function getByPasswordResetToken(passwordResetToken) {
  return User.findOne({ where: { passwordResetToken } });
}

function getByEmail(email) {
  return User.findOne({
    where: { email },
  });
}

function normalize({ id, email }) {
  return { id, email };
}

async function register({ email, password }) {
  const existingUser = await getByEmail(email);

  if (existingUser) {
    throw ApiError.BadRequest('Validation error', {
      email: 'Email is already taken',
    });
  }

  const activationToken = uuidv4();
  const hash = await bcrypt.hash(password, 10);

  await User.create({
    email,
    password: hash,
    activationToken,
  });

  await emailService.sendActivationLink(email, activationToken);
}

async function update(
  id,
  name = undefined,
  newPassword = undefined,
  email = undefined,
) {
  const user = await User.findOne({ where: { id } });

  if (name) {
    user.name = name;
  }

  if (newPassword) {
    const hashedPass = await bcrypt.hash(newPassword, 10);

    user.newPassword = hashedPass;
  }

  if (email) {
    user.email = email;
  }

  if (user) {
    try {
      await user.save();
    } catch (error) {
      // eslint-disable-next-line no-console
      ApiError.NotFound(`User by ${id} not found`, error);
      throw error;
    }
  }
}

async function reqPasswordReset(email) {
  const passwordResetToken = uuidv4();
  const user = await getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User not found');
  }
  user.passwordResetToken = passwordResetToken;
  await user.save();
  emailService.sendResetEmail(email, passwordResetToken);
}

export const userService = {
  getAllActive,
  normalize,
  getByEmail,
  register,
  getOne,
  update,
  reqPasswordReset,
  getByPasswordResetToken,
  validatePassword,
};

// uuidv4();
