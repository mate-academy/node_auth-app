import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/users.js';
import { ApiError  } from '../exeptions/api.errors.js';
import { emailService } from '../services/email.service.js';

async function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

function findByEmail(email) {
  return User.findOne({
    where: { email },
  });
}

function normalized({ id, email }) {
  return { id, email };
}

async function register(email, password, name) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  await User.create({
    email,
    password,
    name,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);
}

async function activate(activationToken) {

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    throw ApiError.notFound()
  }

  user.activationToken = null;
  await user.save();
}

export const userService = {
  getAllActivated,
  findByEmail,
  normalized,
  register,
  activate
};
