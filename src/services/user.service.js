import { User } from '../models/user.js';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from './emai.services.js';
import { ApiError } from '../exceptions/api.error.js';

const getByEmail = (email) => {
  return User.findOne({ where: { email } });
};

const registerUser = async (name, email, password) => {
  const activationToken = uuidv4();
  const isUserExist = await getByEmail(email);

  if (isUserExist) {
    throw ApiError.badRequest('User with this email already exist.');
  }

  await User.create({
    name,
    email,
    password,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);
};

const getAllActivatedUsers = async () => {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
};

const normalize = ({ id, name, email }) => {
  return { id, name, email };
};

export const userService = {
  registerUser,
  getAllActivatedUsers,
  normalize,
  getByEmail,
};
