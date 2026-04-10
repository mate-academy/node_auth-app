import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import { emailService } from './email.service.js';
import { v4 as uuidv4 } from 'uuid';

function normalize({ id, name, email, isActivated }) {
  return {
    id,
    name,
    email,
    isActivated,
  };
}

function findByEmail(email) {
  return User.findOne({
    where: { email },
  });
}

function findById(id) {
  return User.findByPk(id);
}

async function register(name, email, password) {
  const existingUser = await findByEmail(email);

  if (existingUser) {
    throw ApiError.badRequest('User already exists', {
      email: 'User already exists',
    });
  }

  const activationToken = uuidv4();

  const user = await User.create({
    name,
    email,
    password,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);

  return user;
}

async function createResetToken(email) {
  const user = await findByEmail(email);

  if (!user) {
    return;
  }

  user.resetToken = uuidv4();
  user.resetTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60);

  await user.save();

  await emailService.sendResetPasswordEmail(email, user.resetToken);
}

async function findByResetToken(resetToken) {
  return User.findOne({
    where: { resetToken },
  });
}

export const userService = {
  normalize,
  findByEmail,
  findById,
  register,
  createResetToken,
  findByResetToken,
};
