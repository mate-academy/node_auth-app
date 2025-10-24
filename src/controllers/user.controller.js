import { userService } from '../services/user.service.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';
import { emailService } from '../services/email.service.js';
import { User } from '../models/user.js';

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
  const { email, name } = req.body;

  const errors = {
    name: validateName(name),
    email: validateEmail(email),
  };

  if (errors.name || errors.email) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const user = await userService.findByEmail(email);

  user.name = name;
  user.save();

  res.status(200).json({
    message: 'Name was changed',
  });
};

const updateUserPassword = async (req, res) => {
  const { email, oldPassword, password, confirmation } = req.body;

  const user = await userService.findByEmail(email);

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
    throw ApiError.badRequest('Passwords is not equal');
  }

  const hashedPass = await bcrypt.hash(password, 10);

  user.password = hashedPass;
  user.save();

  res.status(200).json({
    message: 'Password was changed',
  });
};

const sendNotificationEmail = async (req, res) => {
  const { email, newEmail, password } = req.body;

  const user = await userService.findByEmail(email);

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

  await userService.sendEmailChange(email, newEmail);

  res.status(200).json({
    message: 'Email send',
  });
};

const updateUserEmail = async (req, res) => {
  const { newEmail, activationEmailToken } = req.params;

  const user = await User.findOne({ where: { activationEmailToken } });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  const oldEmail = user.email;

  user.activationEmailToken = null;
  user.email = newEmail;
  user.save();

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
