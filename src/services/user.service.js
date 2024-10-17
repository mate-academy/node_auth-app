import { ApiError } from '../exception/api.error.js';
import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

export async function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
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

  await emailService.sendActivationEmail(email, activationToken);
}

async function resetPassword(email) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (!existUser) {
    throw ApiError.notFound('Such user does not exist');
  }

  existUser.activationToken = activationToken;
  existUser.save();

  await emailService.sentResetPasswordEmail(email, activationToken);
}

async function changePassword(newPassword, activationToken) {
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    throw new ApiError.notFound('User not found');
  }

  const hashedPass = await bcrypt.hash(newPassword, 5);

  user.password = hashedPass;
  user.activationToken = null;

  return user;
}

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
  resetPassword,
  changePassword,
};
