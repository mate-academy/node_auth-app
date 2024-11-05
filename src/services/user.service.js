import { User } from '../models/user.js';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from './email.service.js';
import { ApiError } from '../exceptions/api.error.js';

function getAllActivated() {
  return User.findAll({ where: { activationToken: null } });
}

function normalize({ id, email }) {
  return { id, email };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

async function register(email, password, name) {
  const activationToken = uuidv4();
  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exists', {
      email: `${email} already exists`,
    });
  }

  await User.create({
    email,
    password,
    name,
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
