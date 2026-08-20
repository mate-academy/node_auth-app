import { TOKEN_TYPES } from '../constants/token.constant.js';
import { AppError } from '../core/AppError.js';
import { User } from '../models/index.js';
import * as mailService from './mail.service.js';
import * as tokenService from './token.service.js';

const getByEmail = async (email) => {
  return User.findOne({
    where: { email },
  });
};

const getById = async (userId) => {
  return User.findOne({
    where: { id: userId },
  });
};

const createUser = async (name, email, password) => {
  return User.create({
    name,
    email,
    password,
    isActive: false,
  });
};

const changePassword = async (userId, previousPassword, newPassword) => {
  const user = await getById(userId);

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await user.comparePassword(previousPassword);

  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  if (previousPassword === newPassword) {
    throw new AppError(
      'New password must be different from the old password',
      400,
    );
  }
  await tokenService.deleteTokenByUserId(user.id, TOKEN_TYPES.REFRESH);

  user.password = newPassword;

  await user.save();

  return user.toSafeObject();
};

const changeName = async (userId, newName) => {
  const user = await getById(userId);

  if (!user) {
    throw new AppError('User not found or session invalid', 401);
  }

  if (user.name === newName) {
    throw new AppError('New name must be different from the old name', 400);
  }

  user.name = newName;

  await user.save();

  return user.toSafeObject();
};

const requestEmailChange = async (userId, password, newEmail) => {
  const user = await getById(userId);

  if (!user) {
    throw new AppError('User not found or session invalid', 404);
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new AppError('Invalid password', 400);
  }

  const isRepeat = await getByEmail(newEmail);

  if (isRepeat) {
    throw new AppError('Email has been already used', 409);
  }

  const token = tokenService.generateEmailChangeToken({ userId, newEmail });

  await mailService.sendEmailChangeLink(newEmail, token);
};

const confirmEmailChange = async (token) => {
  const { userId, newEmail } = tokenService.verifyEmailChangeToken(token);

  const user = await getById(userId);

  if (!user) {
    throw new AppError('User not found or session invalid', 404);
  }

  const isRepeat = await getByEmail(newEmail);

  if (isRepeat) {
    throw new AppError('Email been has already used', 409);
  }

  await mailService.send({
    to: user.email,
    subject: 'Email changing',
    html: `<h1>Your email has been changed to ${newEmail}</h1>`,
  });

  await tokenService.deleteTokenByUserId(user.id, TOKEN_TYPES.REFRESH);

  user.email = newEmail;

  await user.save();

  return user.toSafeObject();
};

export {
  changePassword,
  changeName,
  requestEmailChange,
  confirmEmailChange,
  getByEmail,
  getById,
  createUser,
};
