import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User.js';
import { ApiError } from '../exceptions/api.error.js';
import { emailService } from './email.service.js';

function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

function normalize({ id, name, email }) {
  return { id, name, email };
}

function findByEmail(email) {
  return User.findOne({
    where: { email },
  });
}

async function register(name, email, password) {
  const activationToken = uuidv4();

  const userExists = await findByEmail(email);

  if (userExists) {
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

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
};
