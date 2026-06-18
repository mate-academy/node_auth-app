import { v4 as uuidv4 } from 'uuid';
import { emailService } from './email.service.js';
import { User } from '../models/user.js';
import { ApiError } from '../exeptions/api.error.js';

function normalize({ id, email }) {
  return { id, email };
}

function profileNormalize({ id, name, email }) {
  return { id, name, email };
}

async function findByEmail(email) {
  const user = await User.findOne({ where: { email } });

  return user;
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

const registerOAuth = async (name, email) => {
  return User.create({
    name,
    email,
    password: uuidv4(),
    activationToken: null,
  });
};

export const userService = {
  normalize,
  profileNormalize,
  findByEmail,
  register,
  registerOAuth,
};
