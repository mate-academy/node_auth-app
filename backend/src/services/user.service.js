import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import { emailService } from './email.service.js';
import { v4 as uuidv4 } from 'uuid';

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
  await User.create({ name, email, password, activationToken });

  await emailService.sendActivationEmail(email, activationToken);
}

async function passwordReset(email) {
  const resetToken = uuidv4();

  const user = await findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  user.activationToken = resetToken;
  await user.save();

  await emailService.sendResetEmail(email, resetToken);
}

export const userService = {
  normalize,
  findByEmail,
  register,
  passwordReset,
};
