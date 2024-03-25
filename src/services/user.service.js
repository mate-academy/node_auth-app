import { v4 as uuidv4 } from 'uuid';
import { emailService } from './email.service.js';
import { User } from '../models/user.js';

async function getAllUsers() {
  return User.findAll({
    order: [['id', 'ASC']],
  });
}

function getByEmail(email) {
  return User.findOne({
    where: {
      email,
    },
  });
}

function getById(id) {
  return User.findOne({
    where: {
      id,
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

async function updateUsername(id, name) {
  await User.update({ name }, { where: { id } });
}

export const userService = {
  getAllUsers,
  register,
  getByEmail,
  getById,
  normalize,
  updateUsername,
};
