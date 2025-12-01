import { ApiError } from '../exeptions/api.error.js';
import { emailService } from './email.service.js';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/user.js';

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

async function sendEmailChange(email, newEmail) {
  const activationEmailToken = uuidv4();

  const user = await findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  user.activationEmailToken = activationEmailToken;
  await user.save();

  await emailService.sendChangeEmailNotification(
    newEmail,
    activationEmailToken,
  );
}

async function sendEmailResetPassword(email, resetPasswordToken) {
  await emailService.sendResetPasswordEmail(email, resetPasswordToken);
}

export const userService = {
  register,
  findByEmail,
  normalize,
  sendEmailChange,
  sendEmailResetPassword,
};
