import { ApiError } from '../exeptions/apiError.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import emailService from './email.service.js';

const getByEmail = (email) => {
  return User.findOne({ where: { email } });
};

const getById = (id) => {
  return User.findOne({ where: { id } });
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

const updateName = async (id, name) => {
  const user = await getById(id);

  user.name = name;

  await user.save();

  return user;
};

const updatePassword = async (id, password) => {
  const user = await getById(id);

  user.password = await bcrypt.hash(password, 10);
  await user.save();
};

const updateEmail = async ({ id, password, newEmail }) => {
  const user = await getById(id);

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw ApiError.BadRequest('validation errors', {
      password: 'Password is wrong',
    });
  }

  if (newEmail === user.email) {
    throw ApiError.BadRequest('validation errors', {
      newEmail: 'Don`t use previous email',
    });
  }

  user.email = newEmail;
  user.activationToken = uuidv4();
  await user.save();
  await emailService.sendConfirmation(newEmail, user.activationToken);
};

export default {
  register,
  getByEmail,
  getById,
  normalize,
  updateName,
  updatePassword,
  updateEmail,
};
