import { ApiError } from '../exeptions/ApiError.js';
import { User } from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { emailService } from './emailService.js';

function getByEmail(email) {
  return User.findOne({
    where: email,
  });
}

function normalize({ name, email, password }) {
  return { name, email, password };
}

async function register({ name, email, password }) {
  const userExists = getByEmail(email);

  if (userExists) {
    throw ApiError.BadRequest('Validation error', {
      email: 'Email is taken',
    });
  }

  const activationToken = uuidv4();
  const hash = await bcrypt.hash(password, 10);

  await User.create({
    name,
    password: hash,
    activationToken,
  });

  await emailService.sendActivationLink(email, activationToken);
}

async function forgotPassword(email) {
  const user = getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('Validation error', {
      email: 'Wrong email',
    });
  }

  const resetToken = uuidv4();

  await user.set({
    resetToken: resetToken,
  });

  await emailService.sendResetLink(email, resetToken);
}

async function resetPassword(user, newPassword) {
  const hash = await bcrypt.hash(newPassword, 10);

  user.set({
    password: hash,
    resetToken: null,
  });

  await user.save();
}

async function nameChange(email, name) {
  const user = getByEmail(email);

  user.set({
    name: name,
  });

  await user.save();
}

async function emailChange(user, email, oldEmail) {
  user.set({
    email: email,
  });

  await user.save();

  await emailService.sendEmailConfirmation(oldEmail);
}

export const userService = {
  register,
  normalize,
  getByEmail,
  resetPassword,
  forgotPassword,
  nameChange,
  emailChange,
};
