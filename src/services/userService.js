import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { emailService } from '../services/emailService.js';
import { ApiError } from '../exceptions/ApiError.js';
import { User } from '../models/User.js';

/* eslint no-console: "warn" */

export const userService = {
  getAllActive,
  normalize,
  getByEmail,
  register,
};

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
  return {
    id, email,
  };
}

async function register({ email, password }) {
  console.info(email, password);

  const existingUser = await getByEmail(email);

  if (existingUser) {
    throw ApiError.BadRequest('Validation error', {
      email: 'Email is already taken',
    });
  }

  const activationToken = uuidv4();
  const hash = await bcrypt.hash(String(password), 10);

  await User.create({
    email,
    password: hash,
    activationToken,
  });

  await emailService.sendActivationLink(email, activationToken);
}
