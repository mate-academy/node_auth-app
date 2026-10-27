import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';

export async function getAllActivated() {
  return User.findAll({
    where: { activationToken: null },
  });
}

function normalize({ id, email, name }) {
  return { id, email, name };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

async function register(email, password, name) {
  const activationToken = uuid();
  const existUser = await findByEmail(email);
  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }
  await User.create({ email, password, activationToken, name });

  await emailService.sendActivatationEmail(email, activationToken);
}

async function updateName(userId, name) {
  // методи оновлення
  const user = await User.findByPk(userId);
  user.name = name;
  await user.save();
  return user;
}

async function updatePassword(userId, oldPassword, newPassword) {
  const user = await User.findByPk(userId);
  const isValid = await bcrypt.compare(oldPassword, user.password);
  if (!isValid) {
    throw ApiError.badRequest('Wrong password');
  }
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
}

async function updateEmail(userId, password, newEmail) {
  const user = await User.findByPk(userId);
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw ApiError.badRequest('Wrong password');
  }
  // Повідомити стару електронну адресу про зміну
  await emailService.sendEmailChangeNotification(user.email, newEmail);
  user.email = newEmail;
  await user.save();
}

async function getByResetToken(token) {
  return User.findOne({ where: { resetPasswordToken: token } });
}

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
  updateName,
  updatePassword,
  updateEmail,
  getByResetToken,
};
