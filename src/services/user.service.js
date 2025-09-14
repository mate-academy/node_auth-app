/* eslint-disable no-console */
import { v4 as uuidv4 } from 'uuid';
import { User, Token } from '../models/index.js';
import { ApiError } from '../exeptions/api.error.js';
import { emailService } from './email.service.js';

const normalize = ({ id, name, email }) => {
  return { id, name, email };
};

const findByEmail = (email) => {
  return User.findOne({ where: { email } });
};

const register = async (name, email, password) => {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exists', {
      email: 'User already exists',
    });
  }

  await User.create({
    name,
    email,
    password,
    activationToken,
  });

  try {
    await emailService.sendActivationEmail(email, activationToken);
  } catch (err) {
    console.error('Failed to send activation email:', err);
  }
};

const passwordReset = async (email) => {
  const resetToken = uuidv4();
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  const user = await findByEmail(email);

  if (!user) {
    return;
  }

  user.resetToken = resetToken;
  user.resetTokenExpires = expires;
  await user.save();

  try {
    await emailService.sendResetEmail(email, resetToken);
  } catch (err) {
    console.error('Failed to send password reset email:', err);
  }
};

const save = async (userId, newToken) => {
  const token = await Token.findOne({ where: { userId } });

  if (!token) {
    await Token.create({ userId, refreshToken: newToken });

    return;
  }

  token.refreshToken = newToken;

  await token.save();
};

const getByToken = (refreshToken) => {
  return Token.findOne({ where: { refreshToken } });
};

const remove = (userId) => {
  return Token.destroy({ where: { userId } });
};

export const userService = {
  normalize,
  findByEmail,
  register,
  passwordReset,
  save,
  getByToken,
  remove,
};
