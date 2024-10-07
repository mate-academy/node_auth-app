import { ApiError } from '../exceptions/api.error.js';
import { User } from '../models/User.model.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuid } from 'uuid';

function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

function getUserActivated(email) {
  return User.findOne({
    where: {
      activationToken: null,
      email: email,
    },
  });
}

function normalize({ id, name, email }) {
  return { id, name, email };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

async function register(name, email, password) {
  const activationToken = uuid();
  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.BadRequest('User already exist', {
      email: 'User already exist',
    });
  }

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
  getUserActivated,
};
