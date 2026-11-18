import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';

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

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
  createTokenResetSendMail,
  resetTokenCreateNewPassword,
};
