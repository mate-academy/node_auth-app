import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { emailService } from '../services/emailService';
import { ApiError } from '../services/ApiError';
import { User } from '../models/User';

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
    throw ApiError.BadRequest('Validation error', {
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

  await emailService.sendActivationLink(email, activationToken);
}

export const userService = {
  getAllActive,
  getByEmail,
  normalize,
  register,
};
