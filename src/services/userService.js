
import { ApiError } from '../exeptions/apiError.js';
import { User } from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from '../services/emailService.js';
import bcrypt from 'bcrypt';

export const getAllActive = () => {
  return User.findAll({
    where: { activationToken: null },
  });
};

export const normalize = ({ id, email }) => {
  return {
    id,
    email,
  };
};

export const findByEmail = (email) => {
  return User.findOne({
    where: { email },
  });
};

export const register = async(email, password) => {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  await User.create({
    email, password, activationToken,
  });

  await emailService.sendActivationLink(email, activationToken);
};

export const reset = async(email, password) => {
  const user = await findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('Validation error', {
      email: 'Email is wrong',
    });
  }

  const hash = await bcrypt.hash(password, 10);

  user.password = hash;
  user.recoverToken = null;

  await user.save();
};

export const updateName = async(email, fullName) => {
  const user = await findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('Validation error', {
      email: 'Email is wrong',
    });
  }

  user.fullName = fullName;

  await user.save();
};

export const updateEmail = async(oldEmail, newEmail) => {
  const user = await findByEmail(oldEmail);

  if (!user) {
    throw ApiError.badRequest('Validation error', {
      email: 'Email is wrong',
    });
  }

  const activationToken = uuidv4();

  user.email = newEmail;

  user.activationToken = activationToken;

  await emailService.sendActivationLink(newEmail, activationToken);
  await emailService.sendEmailChanged(oldEmail);
  await user.save();

  return user;
};

export const userService = {
  getAllActive,
  normalize,
  findByEmail,
  register,
  reset,
  updateName,
  updateEmail,
};
