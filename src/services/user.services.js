import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import { emailServices } from '../services/mail.services.js';
import { v4 as uuidv4 } from 'uuid';
import bycrypt from 'bcrypt';

function getAllActivated() {
  return User.findAll({
    where: { activationToken: null },
  });
}

function normalize({ id, email }) {
  return { id, email };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

async function register(name, email, password) {
  const activationToken = uuidv4();
  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  await User.create({
    name,
    email,
    password,
    activationToken,
  });

  await emailServices.sendActivationEmail(name, email, activationToken);
}

async function resetPassword(email) {
  const resToken = uuidv4();
  const findUser = await findByEmail(email);

  if (!findUser) {
    throw ApiError.badRequest('sorry');
  }
  findUser.resetToken = resToken;
  await findUser.save();
  await emailServices.sendResetEmail(email, resToken);
}

async function confirmReset(password1, password2, resetToken) {
  if (password1 !== password2 || !resetToken) {
    throw ApiError.badRequest('Password do not match');
  }

  const findUser = await User.findOne({ where: { resetToken } });

  if (!findUser) {
    throw ApiError.badRequest('try again');
  }

  const hashedPass = await bycrypt.hash(password1, 10);

  findUser.resetToken = null;
  findUser.password = hashedPass;
  await findUser.save();
}

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
  resetPassword,
  confirmReset,
};
