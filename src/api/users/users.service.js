import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { ApiError } from '../../exceptions/api.error.js';
import { User } from './User.model.js';
import { emailService } from '../../services/email.service.js';

export const hashPassword = (password) => bcrypt.hash(password, 10);

export const getAll = async (filters = {}) => {
  const users = await User.findAll({
    order: [['createdAt', 'DESC']],
    where: filters,
  });

  return users;
};

export const getOne = async (id) => {
  const user = await User.findOne({ where: { id } });

  return user;
};

export const findByEmail = async (email) => {
  const user = await User.findOne({ where: { email } });

  return user;
};

export const getByResetPasswordToken = async (token) => {
  const user = await User.findOne({ where: { resetPasswordToken: token } });

  return user;
};

export const create = async (user) => {
  const newUser = await User.create(user);

  return newUser;
};

export const update = async (id, data) => {
  if (data.password) {
    data.password = await hashPassword(data.password);
  }

  await User.update(data, { where: { id } });

  const updatedUser = await User.findOne({ where: { id } });

  return updatedUser;
};

export const deleteById = async (id) => {
  const deletedUser = await User.destroy({ where: { id } });

  return deletedUser;
};

export const isValidParams = (params) => {
  if (!params) {
    return false;
  }

  const { name, email, password } = params;

  return Boolean(name && email && password);
};

export const normalize = ({ id, email, name, activationToken }) => {
  return {
    id,
    email,
    name,
    activationToken,
  };
};

export const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    throw ApiError.badRequest('User already exists', {
      email: 'Email already exists',
    });
  }

  const activationToken = uuidv4();

  await User.create({
    name,
    email,
    password,
    activationToken,
  });

  await emailService.sendActivationMail({ email, activationToken });
};
