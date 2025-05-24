import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/user.js';
import { emailService } from './email.service.js';
import { ApiError } from '../exeptions/api.error.js';

function getAllActivated() {
  return User.findAll({ where: { activationToken: null } });
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

function findById(id) {
  return User.findByPk(id);
}

function normalize({ id, email, username }) {
  return { id, email, username };
}

async function register({ email, password, username }) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User with this email already exists', {
      email: 'User with this email already exists',
    });
  }

  await User.create({
    email,
    password,
    username,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);
}

function updateRefreshToken(userId, refreshToken) {
  return User.update({ refreshToken }, { where: { id: userId } });
}

export const userService = {
  getAllActivated,
  findByEmail,
  findById,
  normalize,
  register,
  updateRefreshToken,
};
