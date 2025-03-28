import { ApiError } from '../exeptions/apiError.js';
import { User } from '../models/user.model.js';
import { emailService } from '../service/email.service.js';
import { v4 as uuidv4 } from 'uuid';

function getAllActive() {
  return User.findAll({
    where: { activationToken: null },
  });
}

function normalize({ id, email }) {
  return { id, email };
}

function findByEmail(email) {
  return User.findOne({
    where: { email },
  });
}

async function register(req, res) {
  const { email, password } = req.body;
  // Отримуємо email і password з тіла запиту

  if (!email || !password) {
    return res.status(400).send({ message: 'Email and password are required' });
  }

  const activationdToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest({
      email: 'User already exists',
    });
  }

  await User.create({ email, password });
  await emailService.sendActivationEmail(email, activationdToken);

  res.status(201).send({
    message: 'User registered successfully, please check your email.',
  });
}

export const userService = {
  getAllActive,
  normalize,
  findByEmail,
  register,
};
