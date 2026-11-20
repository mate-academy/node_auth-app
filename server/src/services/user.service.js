import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

function normalize({ id, name, email }) {
  return { id, name, email };
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

async function createTokenResetSendMail(email) {
  const existUser = await findByEmail(email);

  if (!existUser) {
    throw ApiError.notFound({ email: 'No such user' });
  }

  const resetToken = uuidv4();

  existUser.resetToken = resetToken;
  await existUser.save();
  await emailService.sendResetEmail(email, resetToken);
}

async function resetTokenCreateNewPassword(resetToken, password) {
  const user = await User.findOne({ where: { resetToken } });

  if (!user) {
    throw ApiError.notFound();
  }

  user.resetToken = null;
  user.password = password;
  await user.save();
}

async function changeName(id, name) {
  const user = await User.findOne({ where: { id } });

  if (!user) {
    throw ApiError.notFound();
  }

  user.name = name;
  await user.save();

  return normalize(user);
}

async function changePassword(id, oldPassword, newPassword) {
  const user = await User.findOne({ where: { id } });

  if (!user) {
    throw ApiError.notFound();
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password', {
      oldPassword: 'Wrong password',
    });
  }

  const hashePass = await bcrypt.hash(newPassword, 10);

  user.password = hashePass;
  await user.save();
}

async function changeEmail(id, password, newEmail) {
  const user = await User.findOne({ where: { id } });

  if (!user) {
    throw ApiError.notFound();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password', {
      password: 'Wrong password',
    });
  }

  const existUser = await findByEmail(newEmail);

  if (existUser) {
    throw ApiError.badRequest('Bad request', {
      newEmail: 'Email is already taken',
    });
  }

  const resetEmailToken = uuidv4();

  user.resetEmailToken = resetEmailToken;
  user.newEmail = newEmail;
  await user.save();

  await emailService.sendChangeEmail(newEmail, resetEmailToken);
}

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
  createTokenResetSendMail,
  resetTokenCreateNewPassword,
  changeName,
  changePassword,
  changeEmail,
};
