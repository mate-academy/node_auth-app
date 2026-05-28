import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import { emailService } from '../service/email.service.js';
import { v4 as uuidv4 } from 'uuid';

export function getAllActivated() {
  return User.findAll({
    where: { activationToken: null },
  });
}

function normalizeUser({ name, id, email } = {}) {
  return { name, id, email };
}

export function findByEmail(email) {
  return User.findOne({
    where: { email },
  });
}

async function register(name, email, password) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  await User.create({
    name,
    email,
    password,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken, 'activate', {
    title: 'Activate account',
  });
}

export const userService = {
  getAllActivated,
  normalizeUser,
  findByEmail,
  register,
};
