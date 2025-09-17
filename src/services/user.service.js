import { emailService } from './email.service.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';

function normalizeUser({ id, name, email }) {
  return {
    id,
    name,
    email,
  };
}

function getUserById(id) {
  return User.findByPk(id);
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

async function register(email, password, name) {
  const activationToken = uuidv4();

  const userExist = await findByEmail(email);

  if (userExist) {
    const error = new Error('User already exists');

    error.status = 400;
    throw error;
  }

  await User.create({
    name,
    email,
    password,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);
}

async function emailChange(userId, password, newEmail) {
  const user = await User.findByPk(userId);

  if (!user) {
    const error = new Error('User not found');

    error.status = 404;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const error = new Error('Password is incorrect');

    error.status = 401;
    throw error;
  }

  const resetEmailToken = uuidv4();

  user.resetEmailToken = resetEmailToken;
  user.pendingEmail = newEmail;
  await user.save();

  // повідомлення на старий email
  await emailService.send({
    email: user.email,
    subject: 'Email change notification',
    html: `<p>You requested to change your email to <b>${newEmail}</b>. If this was not you, please contact support.</p>`,
  });

  // підтвердження на новий email
  await emailService.sendChangeEmailLink(newEmail, resetEmailToken);

  return { message: 'Confirmation link sent to new email' };
}

async function confirmEmailChange(resetEmailToken) {
  const user = await User.findOne({ where: { resetEmailToken } });

  if (!user || !user.pendingEmail) {
    const error = new Error('Invalid or expired token');

    error.status = 400;
    throw error;
  }

  user.email = user.pendingEmail;
  user.pendingEmail = null;
  user.resetEmailToken = null;

  await user.save();

  return { message: 'Email successfully changed' };
}

export const userService = {
  getUserById,
  normalizeUser,
  findByEmail,
  register,
  emailChange,
  confirmEmailChange,
};
