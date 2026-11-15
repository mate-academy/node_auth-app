import { User } from '../models/user.model.js';
import bcrypt from 'bcrypt';
import { emailService } from '../services/email.service.js';
import { userService } from '../services/user.service.js';
import { ApiError } from '../exceptions/api.error.js';

async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw ApiError.badRequest('Name, email and password are required');
  }

  if (await User.findOne({ where: { email } })) {
    throw ApiError.conflict('this email is already used');
  }

  const securedPassword = await bcrypt.hash(password, 10);
  const activationToken = crypto.randomUUID();

  await User.create({
    name,
    email,
    password: securedPassword,
    activationToken,
  });

  await emailService.sendActivationEmail(email, activationToken);

  res.status(201).send({ message: 'Check your email' });
}

async function activate(req, res) {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    throw ApiError.notFound('Activation link is invalid or already used');
  }

  user.activationToken = null;
  await user.save();

  res.send({ user: userService.normalize(user) });
}

export const authController = {
  register,
  activate,
};
