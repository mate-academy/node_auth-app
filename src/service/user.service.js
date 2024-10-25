import { v4 as uuidv4 } from 'uuid';
import { User } from '../modules/User.js';
import { emailService } from './email.service.js';
import { ApiError } from '../exeptions/api.error.js';
import { ConsoleLogger } from '../untils/consoleLogger.js';

async function findByUser(email, userName) {
  const emailUser = await User.findOne({ where: { email } });
  const nameUser = await User.findOne({ where: { userName } });

  return {
    emailUser,
    nameUser,
  };
}

function validateEmail(value) {
  const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!value) {
    return 'Email is required';
  }

  if (!EMAIL_PATTERN.test(value)) {
    return 'Email is not valid';
  }
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
}

async function register(email, password, userName) {
  const activationToken = uuidv4();

  const existUser = await findByUser(email, userName);

  if (existUser) {
    const errorMessage = {};

    if (existUser.emailUser === email) {
      errorMessage.email = 'Email already exists';
    }

    if (existUser.nameUser === userName) {
      errorMessage.userName = 'Username already exists';
    }

    if (Object.keys(errorMessage).length > 0) {
      throw ApiError.badRequest('User already exists', errorMessage);
    }
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
  const existUser = await User.findOne({ where: { userName: newName } });

  if (existUser) {
    throw ApiError.badRequest('Username is already taken');
  }

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  user.userName = newName;
  await user.save();

  ConsoleLogger.log(`${userName} change to ${newName}`);
};

const changeEmail = async (userName, newEmail) => {
  const resetToken = uuidv4();
  const user = await User.findOne({ where: { userName } });
  const existUser = await User.findOne({ where: { userName: newEmail } });

  if (existUser) {
    throw ApiError.badRequest('Email is already taken');
  }

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
  validateEmail,
  validatePassword,
  getAllActivated,
  sendResetEmail,
  changePassword,
  changeName,
  changeEmail,
};
