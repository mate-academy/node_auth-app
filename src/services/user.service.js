import { User } from '../models/user.js';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from './email.service.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }

  return null;
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }

  return null;
}

function getAllActivated() {
  return User.findAll({ where: { activationToken: null } });
}

function normalize({ id, email }) {
  return { id, email };
}

function findByEmail(email = '') {
  return User.findOne({ where: { email } });
}

async function register({ email, password, name }) {
  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exists', {
      email: 'Email already exists',
    });
  }

  const activationToken = uuidv4();
  const newUser = await User.create({
    email,
    password,
    activationToken,
    name,
  });

  await emailService.sendActivationEmail(email, activationToken);

  return newUser;
}

function validateDataForRegistration({ email, password }) {
  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }
}

async function createResetPasswordToken(user) {
  const token = uuidv4();

  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000;
  emailService.sendRefreshPassEmail(user.email, token);

  await user.save();
}

async function changeUserPassword(user, password) {
  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save();
}

async function updateEmail({ user, password, newEmail, oldEmail }) {
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw ApiError.badRequest("Password doesn't match");
  }

  if (user.email === newEmail) {
    throw ApiError.badRequest('New email cannot be the same as the old email');
  }

  user.email = newEmail;
  await user.save();
  emailService.sendEmailWasChangedMessage(oldEmail);
}

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
  validateDataForRegistration,
  createResetPasswordToken,
  changeUserPassword,
  validatePassword,
  updateEmail,
};
