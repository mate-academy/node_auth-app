import { ApiError } from '../exceptions/api.error.js';
import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';

export function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

function normalize({ name, id, email }) {
  return { name, id, email };
}

function findByEmail(email) {
  return User.findOne({
    where: { email },
  });
}

async function register(name, email, password) {
  const activationToken = uuidv4();

  const activationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
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
    activationTokenExpiresAt,
  });

  await emailService.sendActivationEmail(email, activationToken);
}

async function updateName(userId, name) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.name = name;
  await user.save();

  return user;
}

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
  updateName,
};
