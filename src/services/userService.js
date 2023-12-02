import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { ApiError } from '../exceptions/ApiError.js';
import { User } from '../models/User.js';
import { emailService } from './emailService.js';
import { tokenService } from './tokenService.js';

function normalize({ id, name, email }) {
  return {
    id,
    name,
    email,
  };
}

function getByEmail(email) {
  return User.findOne({
    where: { email },
  });
}

async function registration({ name, email, password }) {
  const isExist = await User.findOne({ where: { email } });

  if (isExist) {
    throw ApiError.BadRequest('User with such email already exist');
  }

  const confirmEmailToken = uuidv4();
  const hash = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hash,
    confirmEmailToken,
  });

  await emailService.sendActivationMail(email, confirmEmailToken);
};

async function sendResetPasswordMail(email) {
  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest('User not found');
  }

  const confirmEmailToken = uuidv4();

  user.confirmEmailToken = confirmEmailToken;
  await user.save();

  await emailService.sendResetMail(email, confirmEmailToken);
}

async function resetPassword(password, confirmEmailToken) {
  const user = await User.findOne({ where: { confirmEmailToken } });

  if (!user) {
    throw ApiError.BadRequest('User not found');
  }

  const hash = await bcrypt.hash(password, 10);

  user.password = hash;
  user.confirmEmailToken = null;
  user.save();
}

async function updateName(id, name) {
  const user = await User.findOne({ where: { id } });

  user.name = name;
  await user.save();

  return normalize(user);
}

async function updateEmail(id, email) {
  const isExist = await User.findOne({ where: { email } });

  if (isExist) {
    throw ApiError.BadRequest('User with such email already exist');
  }

  const user = await User.findOne({ where: { id } });
  const confirmEmailToken = uuidv4();
  const oldEmail = user.email;

  user.email = email;
  user.confirmEmailToken = confirmEmailToken;

  await user.save();
  await tokenService.remove(id);

  await emailService.sendActivationMail(email, confirmEmailToken);
  await emailService.sendChangeMail(oldEmail);
}

async function updatePassword(id, password) {
  const user = await User.findOne({ where: { id } });

  const hash = await bcrypt.hash(password, 10);

  user.password = hash;

  await user.save();
  await tokenService.remove(id);
}

export const userService = {
  normalize,
  getByEmail,
  registration,
  sendResetPasswordMail,
  resetPassword,
  updateName,
  updateEmail,
  updatePassword,
};
