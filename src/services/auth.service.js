import { ApiError } from '../exeptetion/apiError.js';
import { User } from '../models/User.model.js';
import { emailService } from './email.service.js';
import { v4 as uuid4 } from 'uuid';

const register = async ({ name, email, password }) => {
  const existUSer = await findByEmail(email);
  const activationToken = uuid4();
  const href = `${process.env.CLIENT_HOST}/auth/activation/${token}`;
  const html = `
  <h1>Click for activate Account</h1>
  <a href="${href}">${href}</a>
`;

  if (existUSer) {
    throw ApiError.badRequest('user already exist', {
      email: 'user already exist',
    });
  }
  await User.create({ name, email, password, activationToken });
  await emailService.sendActivationEmail(email, html);
};

const activateUser = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    throw ApiError.notFound();
  }

  user.activationToken = null;
  user.save();
};

const findByEmail = async (email) => {
  const user = await User.findOne({ where: { email } });

  return user;
};

const normalized = ({ id, name, email }) => {
  return { id, name, email };
};

export const authService = {
  register,
  findByEmail,
  normalized,
  activateUser,
};
