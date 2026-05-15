import { randomUUID } from 'crypto';
import { User } from '../models/user.js';
import { ApiError } from '../exeptions/api.error.js';
import { emailService } from './email.service.js';

function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

function normalize({ id, email, name }) {
  return { id, email, name };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

function findById(id) {
  return User.findByPk(id);
}

async function register(name, email, hashedPassword) {
  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exists', {
      email: 'User already exists',
    });
  }

  const activationToken = randomUUID();
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    activationToken,
  });

  await emailService.sendActivationEmail({ email, activationToken });

  return user;
}

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  findById,
  register,
};
