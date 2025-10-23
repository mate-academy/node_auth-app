import { ApiError } from '../exceptions/api.error.js';
import { User } from '../models/user.model.js';
import { mailer } from '../utils/nodemailer.js';
import { v4 as uuidv4 } from 'uuid';

async function findUserByEmail(email) {
  const user = await User.findOne({ where: { email } });

  return user;
}

function normalizeUser({ id, name, email }) {
  return { id, name, email };
}

async function registration(name, email, password) {
  const userExist = await findUserByEmail(email);

  if (userExist) {
    throw ApiError.badRequest('User already exists', {
      email: 'User already exists',
    });
  }

  const activationToken = uuidv4();
  const user = await User.create({
    email,
    name,
    password,
    activationToken,
  });

  await mailer.sendActivationEmail(email, activationToken);

  return user;
}

export const userService = {
  registration,
  findUserByEmail,
  normalizeUser,
};
