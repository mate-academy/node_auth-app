import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import { emailService } from './email.service.js';
import { v4 as uuidv4 } from 'uuid';
import { jwtService } from './jwt.service.js';
import bcrypt from 'bcrypt';

function getAllInfo() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

function normalize({ id, name, email, password }) {
  return {
    id,
    name,
    email,
    password,
  };
}

function findByEmail(email) {
  const user = User.findOne({ where: { email } });

  return user;
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

async function resetPassword(email) {
  const user = await findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const userData = normalize(user);
  const resetToken = jwtService.signReset(userData);

  user.resetToken = resetToken;
  await user.save();

  await emailService.sendResetPasswordEmail(user.email, resetToken);
}

const updateUserData = async (data, id) => {
  const user = await User.findOne({ where: { id } });

  if (!user) {
    throw ApiError.notFound();
  }

  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  await user.update(data);
};

export const profileService = {
  getAllInfo,
  normalize,
  findByEmail,
  register,
  resetPassword,
  updateUserData,
};
