import { v4 as uuidv4 } from 'uuid';
import { emailService } from './email.service.js';
import { User } from '../models/user.js';

async function getAllUsers() {
  return User.findAll();
}

function getByEmail(email) {
  return User.findOne({
    where: {
      email,
    },
  });
}

async function register(name, email, password) {
  const activationToken = uuidv4();

  await User.create({
    name,
    email,
    password,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);
}

function normalize({ id, email }) {
  return { id, email };
}

export const userService = {
  getAllUsers,
  register,
  getByEmail,
  normalize,
};
