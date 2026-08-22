import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

async function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

async function findByEmail(email) {
  return User.findOne({ where: { email } });
}

async function findById(id) {
  return User.findByPk(id);
}

async function register(name, email, password) {
  const activationToken = uuidv4();
  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  await User.create({ name, email, password, activationToken });

  await emailService.sendActivationEmail(email, activationToken);
}

async function requestPasswordReset(email) {
  const user = await findByEmail(email);

  if (!user) {
    return;
  }

  const resetToken = uuidv4();

  user.resetToken = resetToken;
  user.resetTokenExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await user.save();

  await emailService.sendPasswordResetEmail(user.email, resetToken);
}

async function resetPassword(token, newPassword) {
  const user = await User.findOne({ where: { resetToken: token } });

  if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
    throw ApiError.badRequest('Reset link is invalid or has expired');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = null;
  user.resetTokenExpires = null;
  await user.save();
}

async function updateName(userId, name) {
  const user = await findById(userId);

  if (!user) {
    throw ApiError.notFound();
  }

  user.name = name;
  await user.save();

  return user;
}

async function updatePassword(userId, oldPassword, newPassword) {
  const user = await findById(userId);

  if (!user) {
    throw ApiError.notFound();
  }

  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isOldPasswordValid) {
    throw ApiError.badRequest('Old password is wrong', {
      oldPassword: 'Old password is wrong',
    });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return user;
}

async function updateEmail(userId, password, newEmail) {
  const user = await findById(userId);

  if (!user) {
    throw ApiError.notFound();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Password is wrong', {
      password: 'Password is wrong',
    });
  }

  const existUser = await findByEmail(newEmail);

  if (existUser) {
    throw ApiError.badRequest('Email is already taken', {
      newEmail: 'Email is already taken',
    });
  }

  const oldEmail = user.email;

  user.email = newEmail;
  await user.save();

  await emailService.sendEmailChangedNotification(oldEmail, newEmail);

  return user;
}

function normalize({ id, name, email }) {
  return {
    id,
    name,
    email,
  };
}

export const userService = {
  getAllActivated,
  findByEmail,
  findById,
  register,
  requestPasswordReset,
  resetPassword,
  updateName,
  updatePassword,
  updateEmail,
  normalize,
};
