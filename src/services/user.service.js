import { ApiError } from '../exceptions/api.error.js';
import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';

import { v4 as uuidv4 } from 'uuid';

async function getAllActivated() {
  return await User.findAll({
    where: {
      activationToken: null,
    },
  });
}

function normalize({ id, email }) {
  return { id, email };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

async function register(email, password) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  await User.create({ email, password, activationToken });

  await emailService.sendActivationEmail(email, activationToken);
}

export const userServices = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
};
