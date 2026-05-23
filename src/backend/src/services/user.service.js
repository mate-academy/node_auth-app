import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidvv4 } from 'uuid';

function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

function normalizeData({ id, name, email }) {
  return { id, name, email };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

function findById(id) {
  return User.findByPk(id);
}

async function register(name, email, password) {
  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exists');
  }

  const activationToken = uuidvv4();

  await User.create({
    name,
    email,
    password,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);
}

async function sendPasswordResetLink(email) {
  const existUser = await findByEmail(email);

  // We intentionally do not reveal whether the user exists.
  // Returning the same response for all cases prevents
  // email enumeration attacks and avoids leaking account data.

  if (existUser) {
    const resetToken = uuidvv4();

    await User.update({ resetToken }, { where: { email } });

    await emailService.sendResetPasswordEmail(email, resetToken);
  }
}

async function sendEmailChangeLink(newEmail, currentEmail) {
  const emailChangeToken = uuidvv4();

  await User.update({ emailChangeToken }, { where: { email: currentEmail } });

  await emailService.sendActivationNewEmail(newEmail, emailChangeToken);
};

export const userService = {
  getAllActivated,
  normalizeData,
  findByEmail,
  findById,
  register,
  sendPasswordResetLink,
  sendEmailChangeLink,
};
