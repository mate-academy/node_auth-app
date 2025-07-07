import { ApiError } from '../exceptions/api.error.js';

import { User } from '../models/user.js';

import { emailService } from '../services/email.service.js';

import { v4 as uuidv4 } from 'uuid';

import { jwtService } from './jwt.service.js';

export function getAllActivated() {
  return User.findAll({ where: { activationToken: null } });
}

function normalize({ id, name, email }) {
  return { id, name, email };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

function findById(id) {
  return User.findOne({ where: { id } });
}

async function register(name, email, password) {
  const activationToken = uuidv4();

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
  });

  await emailService.sendActivationEmail(email, activationToken);
}

async function getUser(req) {
  const { refreshToken } = req.cookies;

  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  const user = await findById(userData.id);

  return user;
}

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  findById,
  register,
  getUser,
};
