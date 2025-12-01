/* eslint-disable no-undef */
import { userService } from '../services/user.service.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';
import { emailService } from '../services/email.service.js';
import { User } from '../models/user.js';
import { v4 as uuidv4 } from 'uuid';

function validateEmail(value) {
  const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!value) {
    return 'Email is required';
  }

  if (!EMAIL_PATTERN.test(value)) {
    return 'Email is not valid';
  }
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'Password must be at least 6 characters long';
  }

  if (!/[A-Za-z]/.test(value)) {
    return 'Password must contain at least one letter';
  }

  if (!/\d/.test(value)) {
    return 'Password must contain at least one number';
  }

  return null;
}

const validateName = (value) => {
  if (!value) {
    return 'Name is required';
  }

  if (value.length < 2) {
    return 'At least 2 characters';
  }
};

const updateUserName = async (req, res) => {
  const currentEmail = req.user?.email;

  const { name } = req.body;

  if (!currentEmail) {
    throw ApiError.unauthorized();
  }

  const errors = {
    name: validateName(name),
    email: validateEmail(currentEmail),
  };

  if (errors.name || errors.email) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const user = await userService.findByEmail(currentEmail);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.name = name;
  await user.save();

  res.status(200).json({
    message: 'Name was changed',
  });
};

const updateUserPassword = async (req, res) => {
  const currentEmail = req.user?.email;
  const { oldPassword, password, confirmation } = req.body;

  if (!currentEmail) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(currentEmail);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (!oldPassword) {
    throw ApiError.badRequest('Old password is required');
  }

  const isValidOldPassword = await bcrypt.compare(oldPassword, user.password);

  if (!isValidOldPassword) {
    throw ApiError.badRequest('Wrong password');
  }

  const errors = {
    password: validatePassword(password),
  };

  if (errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  if (password !== confirmation) {
    throw ApiError.badRequest('Passwords are not equal');
  }

  const hashedPass = await bcrypt.hash(password, 10);

  user.password = hashedPass;
  await user.save();

  res.status(200).json({
    message: 'Password was changed',
  });
};

const sendNotificationEmail = async (req, res) => {
  const currentEmail = req.user?.email;
  const { newEmail, password } = req.body;

  if (!currentEmail) {
    throw ApiError.unauthorized();
  }

  if (!newEmail) {
    throw ApiError.badRequest('New email is required', {
      email: 'New email is required',
    });
  }

  const emailError = validateEmail(newEmail);

  if (emailError) {
    throw ApiError.badRequest('Bad request', { email: emailError });
  }

  const user = await userService.findByEmail(currentEmail);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (!password) {
    throw ApiError.badRequest('Password is required to confirm change');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong Password');
  }

  const existUser = await userService.findByEmail(newEmail);

  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  const token = uuidv4();

  user.pendingNewEmail = newEmail;
  user.activationEmailToken = token;
  user.activationEmailExpires = Date.now() + 60 * 60 * 1000;
  await user.save();

  await emailService.sendChangeEmailConfirmation(newEmail, token);

  res.status(200).json({
    message: 'Email sent',
  });
};

const updateUserEmail = async (req, res) => {
  const { activationEmailToken } = req.params;

  if (!activationEmailToken) {
    return res.sendStatus(400);
  }

  const user = await User.findOne({
    where: {
      activationEmailToken,
      activationEmailExpires: { [Op.gt]: Date.now() },
    },
  });

  if (!user || !user.pendingNewEmail) {
    return res.sendStatus(404);
  }

  const oldEmail = user.email;
  const newEmail = user.pendingNewEmail;

  user.email = newEmail;
  user.pendingNewEmail = null;
  user.activationEmailToken = null;
  user.activationEmailExpires = null;

  await user.save();

  await emailService.sendEmailNotification(oldEmail, newEmail);

  res.status(200).json({
    message: 'Email was changed',
  });
};

export const userController = {
  updateUserName,
  updateUserPassword,
  sendNotificationEmail,
  updateUserEmail,
};
