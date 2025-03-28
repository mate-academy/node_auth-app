import { ApiError } from '../exeption/api.errors.js';
import { User } from '../model/user.js';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from './email.service.js';

const getAllActivated = () => {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
};

const normalize = ({ id, email }) => {
  return { id, email };
};

const findByEmail = (email) => {
  return User.findOne({ where: { email } });
};

const register = async (email, password) => {
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
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);
};

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
};
