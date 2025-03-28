import { v4 as uuidv4 } from 'uuid';

import { User } from '../models/user.js';
import { ApiError } from '../exceptions/apiError.js';
import { emailService } from './emailService.js';

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
  return User.findOne({
    where: {
      email,
    },
  });
}

async function register(name, email, password) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User with this email already exists', {
      email: 'User with this email already exists',
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

async function isAuthenticated(id) {
  return User.findOne({ where: {
    id,
    activationToken: null
  } })
}

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
  isAuthenticated,
};
