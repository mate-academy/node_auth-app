import { User } from '../models/user.model.js';
import { dataValidationService } from './dataValidation.service.js';
import { ApiError } from '../exceptions/api.error.js';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from './email.service.js';

const createNewUser = async (name, email, password, activationToken) => {
  return User.create({
    name,
    email,
    password,
    activationToken,
  });
};

const findByToken = async (activationToken) => {
  return User.findOne({
    where: {
      activationToken,
    },
  });
};

const getUserByEmail = async (email) => {
  return User.findOne({
    where: {
      email,
    },
  });
};

const register = async (name, email, password) => {
  const errors = {
    name: dataValidationService.validateName(name),
    email: dataValidationService.validateEmail(email),
    password: dataValidationService.validatePassword(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.badRequest('Some of the passed data was invalid', errors);
  }

  const token = uuidv4();

  const userExists = await getUserByEmail(email);

  if (userExists) {
    throw ApiError.badRequest('Email is already in use by another user', {
      email: 'User already exists',
    });
  }

  await createNewUser(name, email, password, token);
  await emailService.sendActivationEmail(email, token);
};

const normalizeUser = async ({ name, id, email }) => {
  return { name, id, email };
};

export const userService = {
  createNewUser,
  findByToken,
  getUserByEmail,
  register,
  normalizeUser,
};
