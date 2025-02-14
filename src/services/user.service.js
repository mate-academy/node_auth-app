import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User.model.js';
import { emailService } from '../services/email.service.js';

const normalize = ({ id, email }) => {
  return { id, email };
};

const getByEmail = async (email) => {
  const user = await User.findOne({ where: { email } });

  return user;
};

const getAllUsers = async () => {
  return User.findAll({
    where: { activationToken: null },
    order: ['id'],
  });
};

const createUser = async (name, email, password) => {
  const activationToken = uuidv4();

  await User.create({
    name,
    email,
    password,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);
};

export const userService = {
  createUser,
  getAllUsers,
  getByEmail,
  normalize,
};
