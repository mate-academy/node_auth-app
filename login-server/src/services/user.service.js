import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import {
  normalizeEmail,
  validateEmail,
  validateName,
  validatePassword,
} from '../utils/validation.js';

function getAllActivated() {
  return User.findAll({
    where: { activationToken: null },
  });
}

function normalize({ name, id, email }) {
  return { name, id, email };
}

function findByEmail(email) {
  return User.findOne({ where: { email: normalizeEmail(email) } });
}

async function register(name, email, password) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedName = name.trim();

  const existUser = await User.findOne({ where: { email: normalizedEmail } });

  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  const activationToken = uuidv4();

  const newUser = await User.create({
    name: normalizedName,
    email: normalizedEmail,
    password,
    activationToken,
  });

  try {
    await emailService.sendActivationEmail(normalizedEmail, activationToken);
  } catch (err) {
    console.error('[email] Failed to send activation email:', err.message);
  }

  return normalize(newUser);
}

async function updateName(userId, name) {
  const nameError = validateName(name);

  if (nameError) {
    throw ApiError.badRequest(nameError, { name: nameError });
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.name = name.trim();

  await user.save();

  return user;
}

async function updatePassword(
  userId,
  currentPassword,
  newPassword,
  confirmPassword,
) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (typeof currentPassword !== 'string' || !currentPassword) {
    throw ApiError.badRequest('Current password is required');
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  const passwordError = validatePassword(newPassword);

  if (passwordError) {
    throw ApiError.badRequest(`New password: ${passwordError}`);
  }

  if (newPassword !== confirmPassword) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.password);

  if (isSamePassword) {
    throw ApiError.badRequest(
      'New password must differ from the current password',
    );
  }

  user.password = await bcrypt.hash(newPassword, 10);

  await user.save();

  return user;
}

async function updateEmail(userId, password, newEmail, confirmEmail) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (typeof password !== 'string' || !password) {
    throw ApiError.badRequest('Password is required');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Password is incorrect');
  }

  const emailError = validateEmail(newEmail);

  if (emailError) {
    throw ApiError.badRequest(emailError, { email: emailError });
  }

  const normalizedEmail = normalizeEmail(newEmail);

  if (normalizedEmail !== normalizeEmail(confirmEmail)) {
    throw ApiError.badRequest('Emails do not match');
  }

  if (normalizedEmail === user.email) {
    throw ApiError.badRequest('New email must differ from the current one');
  }

  const existingUser = await User.findOne({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw ApiError.badRequest('Email already exists', {
      email: 'Email already exists',
    });
  }

  const oldEmail = user.email;

  user.email = normalizedEmail;

  await user.save();

  try {
    await emailService.sendEmailChangedNotification(oldEmail, normalizedEmail);
  } catch (err) {
    console.error('[email] Failed to notify old email:', err.message);
  }

  return user;
}

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
  updateName,
  updatePassword,
  updateEmail,
};
