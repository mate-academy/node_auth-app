import { ApiError } from '../exceptions/api.error.js';
import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

function normalize({ id, name, email }) {
  return { id, name, email };
}

async function register(name, email, password) {
  const existingUser = await userService.findByEmail(email);

  if (existingUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  const activationToken = uuidv4();

  await User.create({
    name,
    email,
    password,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);
}

export const userService = {
  findByEmail,
  normalize,
  register,
};
