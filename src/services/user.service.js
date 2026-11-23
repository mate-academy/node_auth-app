import { ApiError } from '../exceptions/api.error.js';
import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

export const PASSWORD_MIN_LENGTH = 6;

function getPasswordError(password) {
  if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }

  return null;
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

function normalize({ id, name, email }) {
  return { id, name, email };
}

async function register(name, email, password) {
  const passwordError = getPasswordError(password);

  if (passwordError) {
    throw ApiError.badRequest('Bad request', { password: passwordError });
  }

  const existingUser = await userService.findByEmail(email);

  if (existingUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    });
  }

  const hashedPass = await bcrypt.hash(password, 10);
  const activationToken = uuidv4();

  await User.create({
    name,
    email,
    password: hashedPass,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);
}

export const userService = {
  findByEmail,
  normalize,
  register,
  getPasswordError,
};
