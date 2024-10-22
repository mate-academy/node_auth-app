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

function normalize({ id, email, name }) {
  return { id, email, name };
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
    throw ApiError.notFound('User not found');
  }

  const hashedPass = await bcrypt.hash(newPassword, 5);

  user.password = hashedPass;
  user.activationToken = null;

  return user;
}
async function changeUserPassword(id, oldPassword, password) {
  const user = await User.findOne({ where: { id } });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  const hashedNewPassword = await bcrypt.hash(password, 5);

  user.password = hashedNewPassword;

  await user.save();
}

async function changeNameService(id, newName) {
  const user = await User.findOne({ where: { id } });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.name = newName;

  await user.save();
}

async function changeEmail(id, newEmail, password) {
  const user = await User.findOne({ where: { id } });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const oldEmail = user.email;

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  user.email = newEmail;

  await user.save();

  await emailService.sendEmailChangingNotification(oldEmail);
}

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
  resetPassword,
  changePassword,
  changeNameService,
  changeUserPassword,
  changeEmail,
};
