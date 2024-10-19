import { User } from '../models/user.js';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from './emai.services.js';

const getByEmail = (email) => {
  return User.findOne({ where: { email } });
};

const registerUser = async (name, email, password) => {
  const activationToken = uuidv4();
  const isUserExist = await getByEmail(email);

  if (isUserExist) {
    console.log('user already exist');
  }

  await User.create({ name, email, password, activationToken });

  await emailService.sendActivationEmail(email, activationToken);
};

const getAllUsers = async () => {
  return await User.findAll();
};

const normalize = ({ id, name, email }) => {
  return { id, name, email };
};

export const userService = {
  registerUser,
  getAllUsers,
  normalize,
};
