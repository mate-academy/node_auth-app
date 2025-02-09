import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';

function getAllActivatedUsers() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

function normalize({ id, email }) {
  return { id, email };
}

function findByEmail(email) {
  return User.findOne({
    where: {
      email,
    },
  });
}

async function register(email, password) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  const newUser = await User.create({ email, password, activationToken });
  await emailService.sendActivationEmail(email, activationToken);

  return newUser;
}

async function activate(email, activationToken) {
  const user = await User.findOne({ where: { email } });

  if (!user || user.activationToken !== activationToken) {
    throw ApiError.notFound();
  }

  user.activationToken = null;
  user.save();

  return user;
}

export const userService = {
  getAllActivatedUsers,
  normalize,
  findByEmail,
  register,
  activate,
};
