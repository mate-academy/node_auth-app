import { v4 as uuidv4 } from 'uuid';
import { emailService } from '../services/email.service.js';
import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';

function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

function normalize({ name, id, email }) {
  return { id, email, name };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

async function register(name, email, password) {
  const existingUser = await findByEmail(email);

  if (existingUser) {
    throw ApiError.BadRequest('Validation error', {
      email: 'Email is already taken',
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
  getAllActivated,
  normalize,
  findByEmail,
  register,
};
