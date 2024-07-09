import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { emailService } from '../services/email.service.js';
import { ApiError } from '../exceptions/api.error.js';
import { User } from '../models/user.js';

function getAllActive() {
  return User.findAll({
    where: { activationToken: null },
    order: ['id'],
  });
}

function getByEmail(email) {
  return User.findOne({
    where: { email },
  });
}

function normalize({ id, email }) {
  return { id, email };
}

async function register({ email, password }) {
  const existingUser = await getByEmail(email);

  if (existingUser) {
    throw ApiError.badRequest('Validation error', {
      email: 'Email is already taken',
    });
  }

  const activationToken = uuidv4();
  const hash = await bcrypt.hash(password, 10);

  await User.create({
    email,
    password: hash,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);
}

export const userService = {
  getAllActive,
  normalize,
  getByEmail,
  register,
};

uuidv4();
