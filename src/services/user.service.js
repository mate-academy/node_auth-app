import { User } from '../models/user.model.js';
import { ApiError } from '../exeptions/api.error.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';

function getAllActivated(params) {
  return User.findAll({
    where: { activationToken: null },
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

  const existUser = await findByEmail({ email });

  if (existUser) {
    // eslint-disable-next-line new-cap
    throw new ApiError.badRequest('User already exist', {
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

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
};
