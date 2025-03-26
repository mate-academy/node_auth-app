// @ts-nocheck
import { Users } from '../models/users.js';
import { v4 as uuidv4 } from 'uuid';
import {
  getUserByActivationToken,
  getUserByEmail,
  getUserByPassResetToken,
  updateUserPassword,
} from './user.services.js';
import { ApiError } from '../exeptions/api.error.js';
import { sendActivationEmail, sendPassResetEmail } from './email.service.js';

export const createUser = async (email, password, name) => {
  const activationToken = uuidv4();
  const existUser = await getUserByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  await Users.create({
    email,
    password,
    name,
    activationToken,
  });

  await sendActivationEmail(email, activationToken);
};

export const sendResetUserPassword = async (email) => {
  const resetToken = uuidv4();
  const user = await getUserByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No user with this email');
  }

  await sendPassResetEmail(email, resetToken);

  user.resetToken = resetToken;
  const res = await user.save();
  return res;
};

export const resetPassword = async (password, resetToken) => {
  const user = await getUserByPassResetToken(resetToken);

  if (!user) {
    throw ApiError.notFound();
  }

  return updateUserPassword(user, password);
};

export const activateUser = async (activationToken) => {
  const user = await getUserByActivationToken(activationToken);

  if (!user) {
    throw ApiError.notFound();
  }

  user.activationToken = null;

  const res = await user.save();
  return res;
};

export const login = () => {};
