import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from './email.service.js';

function getAllActivated() {
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

function findById(id) {
  return User.findByPk(id);
}

async function register(username, email, password) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  await User.create({
    username,
    email,
    password,
    activationToken,
  });
  await emailService.sendActivationEmail(email, activationToken);
}

async function saveResetToken(userId, token, expiry) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.resetToken = token;
  user.resetTokenExpiry = expiry;

  await user.save();
  return user;
}

async function findByResetToken(token) {
  return User.findOne({ where: { resetToken: token } });
}

async function updatePassword(userId, hashedPass) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.password = hashedPass;
  user.resetToken = null;
  user.resetTokenExpiry = null;

  await user.save();
  return user;
}

async function updateProfile(userId, { username, email, password }) {
  const user = await User.findByPk(userId);
  if (!user) throw ApiError.notFound('User not found');

  if (username) user.username = username;
  if (email) user.email = email;
  if (password) user.password = password;

  await user.save();
  return user;
}

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
  saveResetToken,
  findByResetToken,
  updatePassword,
  findById,
  updateProfile
};
