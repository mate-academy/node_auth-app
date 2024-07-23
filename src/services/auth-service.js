import bcrypt from 'bcrypt';
import { ApiError } from '../exceptions/API-error.js';
import { User } from '../models/user.model.js';
import { generateActivationToken } from './users-service.js';

export const createUser = async (name, email, password) => {
  const existingUser = await User.findOne({
    where: {
      email,
    },
  });

  if (existingUser !== null) {
    throw ApiError.BadRequest('This email address is used by another user');
  }

  const activationToken = generateActivationToken();

  const hashedPassword = await hashPassword(password);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    activationToken,
  });

  const newUserPublicData = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    activationToken: newUser.activationToken,
  };

  return newUserPublicData;
};

export const findUserByActivationToken = async (activationToken) => {
  return User.findOne({
    where: {
      activationToken,
    },
    attributes: ['id', 'name', 'email'],
  });
};

export const findUserByEmail = async (email) => {
  return User.findOne({
    where: {
      email,
    },
    attributes: ['id', 'email'],
  });
};

export const consumeActivationToken = async (user) => {
  user.activationToken = null;
  await user.save();
};

export const findActivatedUserByEmail = (email) => {
  return User.findOne({
    where: {
      email,
      activationToken: null,
    },
  });
};

const hashPassword = (plainPassword) => {
  return bcrypt.hash(plainPassword, 10);
};

export const updatePassword = async (userId, newPassword) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.NotFound();
  }

  const hashedPassword = await hashPassword(newPassword);

  user.password = hashedPassword;
  await user.save();
};
