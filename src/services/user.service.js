import { User } from '../models/user.js';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from './email.service.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';

function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

function normalize({ id, email }) {
  return { id, email };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

async function register(email, password, name) {
  // activationToken for email
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await User.create({
    email,
    password: hashedPass,
    activationToken,
    name,
  });

  await emailService.sendActivationEmail(email, activationToken);
}

async function login(user, password) {
  if (!user) {
    throw ApiError.forbidden('forbidden', {
      email: 'No such user',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password', {
      password: 'Wrong password',
    });
  }

  if (user.activationToken !== null) {
    throw ApiError.unauthorized({ message: 'Activate your email' });
  }
}

async function resetEmail(email) {
  // resetToken to send on email
  const resetToken = uuidv4();

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.forbidden('Forbidden', {
      email: 'No such user',
    });
  }

  if (!user.isVerified) {
    throw ApiError.forbidden('Forbidden', {
      message: 'Account is not verified. Please verify your email first.',
    });
  }

  user.resetToken = resetToken;
  // reset token expires 1 hour
  user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  await emailService.sendPasswordResetEmail(email, resetToken);
}

async function resetPassword(resetToken, newPassword) {
  const user = await User.findOne({ where: { resetToken } });

  if (!user) {
    throw ApiError.notFound({
      message: 'Invalid or expired password reset token',
    });
  }

  if (user.resetTokenExpires < new Date()) {
    throw ApiError.badRequest('Expired password reset token');
  }

  const hashedPass = await bcrypt.hash(newPassword, 10);

  user.password = hashedPass;
  user.resetToken = null;
  user.resetTokenExpires = null;

  await user.save();
}

async function changeEmail(email, newEmail, id) {
  const existUser = await User.findOne({ where: { email: newEmail } });

  if (existUser) {
    throw ApiError.conflict({ message: 'User with this email already exist' });
  }

  const user = await User.findByPk(id);

  if (!user) {
    throw ApiError.notFound();
  }

  user.email = newEmail;
  user.save();

  await emailService.sendEmailChangeEmail(email, newEmail);
}

async function changePassword(password, id) {
  const user = await User.findByPk(id);

  if (!user) {
    throw ApiError.notFound();
  }

  const hashedPass = await bcrypt.hash(password, 10);

  user.password = hashedPass;
  user.save();
}

async function changeName(newName, id) {
  const user = await User.findByPk(id);

  if (!user) {
    throw ApiError.notFound();
  }

  user.name = newName;
  user.save();
}

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
  login,
  resetEmail,
  resetPassword,
  changeEmail,
  changePassword,
  changeName,
};
