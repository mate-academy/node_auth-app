import { User } from '../models/user.js';
import { ApiError } from '../exeptions/api.error.js';
import { emailService } from './email.service.js';
import { v4 as uuidv4 } from 'uuid';

function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

function normalize({ id, name, email }) {
  return {
    id,
    name,
    email,
  };
}

function findByEmail(email) {
  return User.findOne({
    where: { email },
  });
}

function findById(id) {
  return User.findByPk(id);
}

function findByEmailChangeToken(emailChangeToken) {
  return User.findOne({
    where: { emailChangeToken },
  });
}

function findByResetPasswordToken(resetPasswordToken) {
  return User.findOne({
    where: { resetPasswordToken },
  });
}

async function register(name, email, password) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exists', {
      email: 'User already exists',
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
  findById,
  findByEmailChangeToken,
  findByResetPasswordToken,
  register,
};
