import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';

async function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

async function findByEmail(email) {
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

function normalize({ id, email }) {
  return {
    id,
    email,
  };
}

export const userService = {
  getAllActivated,
  findByEmail,
  register,
  normalize,
};
