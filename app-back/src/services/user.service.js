import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/user.model.js';
import { emailService } from './email.service.js';
import { ApiError } from '../exeptions/api.error.js';

async function getAllActivated() {
  const users = await User.findAll({
    where: {
      activationToken: null,
    },
  });

  return users;
}

async function findUserById(id) {
  return await User.findByPk(id);
}

function normalizedUser({ id, email, name }) {
  return { id, email, name };
}

async function changeName(id, name) {
  const user = await findUserById(id);

  user.name = name;

  await user.save();

  return user;
}

async function changePassword(user, password) {
  user.password = password;

  await user.save();

  return user;
}

async function changeEmail(user, newEmail) {
  const oldEmail = user.email;

  user.email = newEmail;
  await user.save();

  await emailService.sendEmailChangedNotification(oldEmail, newEmail);

  return user;
}


async function findByEmail(email) {
  return await User.findOne({
    where: {
      email,
    },
  });
}

async function register(email, password, name) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exist');
  }

  await User.create({ email, password, activationToken, name });
  await emailService.sendActivationEmail(email, activationToken);
}

async function forgot(email) {
  const resetToken = uuidv4();

  const user = await findByEmail(email);

  if (!user) {
    return;
  }

  user.resetToken = resetToken;

  await user.save();
  await emailService.sendResetPasswordEmail(email, resetToken);
}

export const userService = {
  register,
  getAllActivated,
  normalizedUser,
  findByEmail,
  forgot,
  findUserById,
  changeName,
  changePassword,
  changeEmail,
};
