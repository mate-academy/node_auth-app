import { ApiError } from '../exceptions/api.error.js';
import { User } from '../models/user.js';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from '../services/email.service.js';
import bcrypt from 'bcrypt';

export async function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

function normalize({ id, email, name }) {
  return { id, email, name };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

function findById(id) {
  return User.findByPk(id);
}

async function register(name, email, password) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exists', {
      email: 'User already exists',
    });
  }

  await User.create({
    name,
    email,
    password,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);
}

async function resetPasswordRequest(email) {
  const user = await findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('User not found', {
      email: 'User not found',
    });
  }

  const resetPasswordToken = uuidv4();

  user.resetPasswordToken = resetPasswordToken;
  await user.save();

  await emailService.sendResetPasswordEmail(email, resetPasswordToken);
}

async function resetPassword(token, password) {
  const user = await User.findOne({ where: { resetPasswordToken: token } });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired token');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;
  user.resetPasswordToken = null;
  await user.save();
}

async function updateName(id, name) {
  const user = await findById(id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.name = name;
  await user.save();

  return user;
}

async function changePassword(id, oldPassword, newPassword) {
  const user = await findById(id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Invalid password', {
      oldPassword: 'Invalid password',
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  await user.save();

  return user;
}

async function requestEmailChange(id, newEmail, password) {
  const user = await findById(id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Invalid password', {
      password: 'Invalid password',
    });
  }

  const existingEmail = await findByEmail(newEmail);

  if (existingEmail) {
    throw ApiError.badRequest('Email already in use', {
      newEmail: 'Email already in use',
    });
  }

  const newEmailToken = uuidv4();

  user.newEmail = newEmail;
  user.newEmailToken = newEmailToken;
  await user.save();

  await emailService.sendNewEmailConfirmation(
    newEmail,
    newEmailToken,
    user.email,
  );
}

async function confirmEmailChange(token) {
  const user = await User.findOne({ where: { newEmailToken: token } });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired token');
  }

  const oldEmail = user.email;

  user.email = user.newEmail;
  user.newEmail = null;
  user.newEmailToken = null;
  await user.save();

  await emailService.sendEmailChangeNotification(oldEmail);

  return user;
}

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  findById,
  register,
  resetPasswordRequest,
  resetPassword,
  updateName,
  changePassword,
  requestEmailChange,
  confirmEmailChange,
};
