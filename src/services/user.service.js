import { ApiError } from '../exceptions/api.error.js';
import { User } from '../models/user.js';
import { emailService } from './email.service.js';
import { v4 as uuidv4 } from 'uuid';

function normalize({ name, id, email }) {
  return { name, id, email };
}

function findById(id) {
  return User.findByPk(id);
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

async function register(name, email, password) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.BadRequest('User with this email already exist', {
      email: 'User already exists',
    });
  }

  const newUser = await User.create({
    name,
    email,
    password,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);

  return newUser;
}

export const userService = {
  normalize,
  findById,
  findByEmail,
  register,
};
