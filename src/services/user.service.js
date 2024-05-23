import { ApiError } from '../exeptions/apiError.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import emailService from './email.service.js';

const getByEmail = (email) => {
  return User.findOne({ where: { email } });
};

const normalize = ({ name, email, id }) => {
  return {
    name,
    email,
    id,
  };
};

const register = async ({ email, name, password }) => {
  const existingUser = await getByEmail(email);

  if (existingUser) {
    throw ApiError.BadRequest('Validation error', {
      email: 'Email is already taken',
    });
  }

  const activationToken = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    email,
    name,
    password: hashedPassword,
    activationToken,
  });

  await emailService.sendActivationLink(email, activationToken);
};

export default {
  register,
  getByEmail,
  normalize,
};
