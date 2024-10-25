import { v4 as uuidv4 } from 'uuid';
import { User } from '../modules/User.js';
import { emailService } from './email.service.js';
import { ApiError } from '../exeptions/api.error.js';
import { ConsoleLoger } from '../untils/consoleLoger.js';

async function findByUser(email, userName) {
  const emailUser = await User.findOne({ where: { email } });
  const nameUser = await User.findOne({ where: { userName } });

  return {
    emailUser,
    nameUser,
  };
}

async function register(email, password, userName) {
  const activationToken = uuidv4();

  const existUser = await findByUser(email, userName);

  if (existUser.emailUser || existUser.nameUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
    // throw AppiError.badRequest('User already exist', {
    //   email: existUser.emailUser ? 'Email already exist' : '',
    //   userName: existUser.nameUser ? 'User already exist' : ''
    // });
  }

  await User.create({
    email,
    password,
    userName,
    activationToken,
  });
  await emailService.sendActivation(email, activationToken);
}

const normalize = ({ id, email }) => {
  return { id, email };
};

const getAllActivated = () => {
  return User.findAll({ where: { activationToken: null } });
};

const sendResetEmail = async (email) => {
  const resetToken = uuidv4();
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw ApiError.badRequest('Not found users');
  }

  await emailService.sendReset(email, resetToken);

  user.resetToken = resetToken;
  await user.save();
};

const changePassword = async (userName, newPassword) => {
  const user = await User.findOne({ where: { userName } });

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  user.password = newPassword;
  user.resetToken = null;

  await user.save();
};

const changeName = async (userName, newName) => {
  const user = await User.findOne({ where: { userName } });
  const existUser = await User.findOne({ where: { newName } });

  if (existUser) {
    throw ApiError.badRequest('Username is busy ');
  }

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  user.userName = newName;
  await user.save();

  ConsoleLoger.log(`${userName} change to ${newName}`);
};

const changeEmail = async (userName, newEmail) => {
  const resetToken = uuidv4();
  const user = await User.findOne({ where: { userName } });

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  await emailService.sendConfirmation(newEmail, resetToken);

  user.resetToken = resetToken;
  await user.save();
};

export const userService = {
  register,
  normalize,
  getAllActivated,
  sendResetEmail,
  changePassword,
  changeName,
  changeEmail,
};
