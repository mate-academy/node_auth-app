import { User } from '../models/user.js';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from './email.service.js';
import { ApiError } from '../exceptions/api.error.js';

async function updateEmail(newEmail, userId) {
  const activationToken = uuidv4();
  const existUser = await findByEmail(newEmail);

  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  const user = await findById(userId);

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  user.email = newEmail;
  user.activationToken = activationToken;

  await user.save();
  await emailService.sendActivationEmail(newEmail, activationToken);
}

async function register(email, password, userName) {
  const activationToken = uuidv4();
  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  User.create({
    email,
    password,
    userName,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);
}

function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

function normalize({ userName, email, id }) {
  return { userName, email, id };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

function findById(id) {
  return User.findOne({ where: { id } });
}

function findByActivationToken(activationToken) {
  return User.findOne({ where: { activationToken } });
}

function findByResetToken(resetToken) {
  return User.findOne({ where: { resetToken } });
}

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
  findByActivationToken,
  findByResetToken,
  findById,
  updateEmail,
};
