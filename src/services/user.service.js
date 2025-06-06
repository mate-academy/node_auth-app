import { APIError } from '../exceptions/api.error';
import { User } from '../models/user';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';

export function getAllActivated() {
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

function normalize({ id, email }) {
  return { id, email };
}

function findByEmail(email) {
  return User.findOne({ where: { email } });
}

async function register(email, password) {
  const activationToken = uuidv4();
  const existingUser = await User.findByEmail(email);

  if (existingUser) {
    throw APIError.badRequest('User already exists');
  }
  await User.create({ email, password, activationToken });
  emailService.sendActivationEmail(email, activationToken);
}
export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
};
