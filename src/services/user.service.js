import { User } from '../models/user.model.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from './email.service.js';
import { ApiError } from '../exceptions/api.error.js';

function validateEmail(email) {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!email) {
    return 'Email is required';
  }

  if (!emailPattern.test(email)) {
    return 'Email is not valid';
  }
}

function validatePassword(password) {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'At least 6 characters';
  }
}

const getByEmail = (email) => {
  return User.findOne({ where: { email } });
};

const normalize = ({ id, email }) => {
  return { id, email };
};

const create = async (email, password) => {
  const existingUser = await userService.getByEmail(email);

  if (existingUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const token = uuidv4();

  await emailService.sendActivationLink(email, token);

  await User.create({ email, hashPassword, token });
};

const getAllActive = () => {
  return User.findAll({ where: { activationToken: null } });
};

export const userService = {
  validateEmail,
  validatePassword,
  create,
  getByEmail,
  getAllActive,
  normalize,
};
