import { ApiError } from '../exceptions/api.error.js';
import { User } from '../models/user.model.js';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from './email.service.js';

const normalize = ({ id, name, email }) => {
  return { id, name, email };
};

const createUser = async ({ name, email, password }) => {
  const existUser = await getUserByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exists', {
      email: 'This email is already being used',
    });
  }

  const activationToken = uuidv4();

  await User.create({ name, email, password, activationToken });

  await emailService.sendActivationEmail({ email, activationToken });
};

const getUserByActivationToken = ({ activationToken }) => {
  return User.findOne({ where: { activationToken } });
};

const getUserByEmail = (email) => {
  return User.findOne({ where: { email } });
};

const getAllActivated = () => {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
};

const getUserById = (id) => {
  return User.findOne({ where: { id } });
};

export const userService = {
  normalize,
  createUser,
  getUserByActivationToken,
  getUserByEmail,
  getAllActivated,
  getUserById,
};
